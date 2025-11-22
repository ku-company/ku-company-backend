import { UserRepository } from "../repository/userRepository.js";
import type {
  sign_up_input,
  UserDB,
  Login,
  sign_up_company_input,
  IUserRequest,
} from "../model/userModel.js";
import type {
  UserDTO,
  LoginResponse,
  RefreshTokenRequest,
  UserCompanyDTO,
} from "../dtoModel/userDTO.js";
import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  SignUpStrategyFactory,
  SignUpStrategy,
} from "../helper/signupStrategy.js";
import { S3Service } from "../service/s3Services.js";
import { validateImageBuffer } from "../helper/image.js";
import { ImageKeyStrategy } from "../helper/s3KeyStrategy.js";
import { Role } from "../utils/enums.js";
import { getValidRoles } from "../utils/roleUtils.js";
import { createProfileStrategy } from "../helper/createProfileStrategy.js";
import { DEFAULT_PROFILE_IMAGE_KEY } from "../utils/constants.js";
import { AIService } from "./aiService.js";
import { appLogger, logAuthEvent, logDataChange } from "../utils/logger.js";

export class UserService {
  private userRepository: UserRepository;
  private s3Service: S3Service;
  private aiService: AIService;
  private BUCKET_NAME = process.env.BUCKET_NAME || "";

  constructor() {
    this.userRepository = new UserRepository();
    this.aiService = new AIService();
    this.s3Service = new S3Service(this.BUCKET_NAME, new ImageKeyStrategy());
  }

  async sign_up(input: sign_up_input) {
    if (input.password !== input.confirm_password) {
      throw new Error("Password and Confirm password do not match");
    }
    if (input.email.length < 5 || !input.email.includes("@")) {
      throw new Error("Invalid email");
    }
    if (!input.is_consent) {
      throw new Error("Please agree to the terms and conditions");
    }
    if (
      await this.userRepository.is_valid_create_user(
        input.user_name,
        input.email,
        input.company_name,
      )
    ) {
      let strategy: SignUpStrategy = SignUpStrategyFactory.setStrategy(
        input.role,
      );
      const userData: UserDB = await strategy.create_user(
        this.userRepository,
        input,
      );
      const user = await this.userRepository.get_user_by_email(userData.email);
      if (!user) {
        throw new Error("User not found after creation");
      }
      try {
        const ai_verify = await this.aiService.verify_user(user.id);
      } catch (err: any) {
        appLogger.warn({ msg: "AI verify failed", error: err.message });
      }
      const response = await strategy.sign_up(userData);
      logAuthEvent({
        event: "auth.signup",
        userId: user.id,
        email: user.email,
        success: true,
        correlationId: "service",
      });
      return response;
    }
  }

  async login(input: Login) {
    if (!input.user_name || !input.password) {
      throw new Error("Missing username or password");
    }
    const is_valid = await this.userRepository.is_valid_user(
      input.user_name,
      input.password,
    );
    if (!is_valid) {
      logAuthEvent({
        event: "auth.login",
        success: false,
        reason: "Invalid username or password",
        correlationId: "service",
      });
      throw new Error("Invalid username or password");
    }
    const user = await this.userRepository.get_user_by_userName(
      input.user_name,
    );
    const payload = {
      id: user.id,
      user_name: user.user_name,
      email: user.email,
      role: user.role,
      verified: user.verified,
    };
    const SECRET_KEY = process.env.SECRET_KEY;
    const REFRESH_KEY = process.env.REFRESH_KEY;
    if (!SECRET_KEY) {
      throw new Error("Missing SECRET_KEY");
    }
    if (!REFRESH_KEY) {
      throw new Error("Missing REFRESH_KEY");
    }
    const access_token = jwt.sign(payload, SECRET_KEY, {
      expiresIn: "15m",
      algorithm: "HS256",
    });
    const refresh_token = jwt.sign(payload, REFRESH_KEY, {
      expiresIn: "7d",
      algorithm: "HS256",
    });
    // Enforce single-session (fail-safe) by revoking all existing refresh tokens for this user before registering the new one
    try {
      const { revokeAllTokensForUser, registerRefreshToken } = await import(
        "../utils/tokenBlacklist.js"
      );
      revokeAllTokensForUser(user.id);
      registerRefreshToken(user.id, refresh_token);
    } catch {
      /* ignore tracking errors */
    }

    const response: LoginResponse = {
      id: user.id,
      access_token: access_token,
      refresh_token: refresh_token,
      user_name: user.user_name || "",
      role: user.role,
      email: user.email,
      verified: user.verified,
    };
    logAuthEvent({
      event: "auth.login",
      userId: user.id,
      email: user.email,
      success: true,
      correlationId: "service",
    });
    return response;
  }

  async change_password(
    user_id: number,
    current_password: string,
    new_password: string,
  ) {
    if (!current_password || !new_password) {
      throw new Error("Missing passwords");
    }
    // verify current
    const user = await this.userRepository.get_user_by_id(user_id);
    if (!user.password_hash) {
      throw new Error("No password is set for this account");
    }
    const matches = await bcrypt.compare(current_password, user.password_hash);
    if (!matches) {
      throw new Error("Current password is incorrect");
    }
    // Re-hash new password and persist
    const new_hash = await bcrypt.hash(new_password, 10);
    await this.userRepository.update_password(user_id, new_hash);
    logDataChange({
      userId: user_id,
      entity: "user",
      entityId: user_id,
      operation: "update",
      changedFields: ["password_hash"],
      correlationId: "service",
    });
    // Rotate tokens
    const payload = {
      id: user.id,
      user_name: user.user_name,
      email: user.email,
      role: user.role,
      verified: user.verified,
    };
    const SECRET_KEY = process.env.SECRET_KEY;
    const REFRESH_KEY = process.env.REFRESH_KEY;
    if (!SECRET_KEY || !REFRESH_KEY) {
      throw new Error("Missing JWT keys");
    }
    const access_token = jwt.sign(payload, SECRET_KEY, {
      expiresIn: "15m",
      algorithm: "HS256",
    });
    const refresh_token = jwt.sign(payload, REFRESH_KEY, {
      expiresIn: "7d",
      algorithm: "HS256",
    });
    try {
      const { revokeAllTokensForUser, registerRefreshToken } = await import(
        "../utils/tokenBlacklist.js"
      );
      revokeAllTokensForUser(user.id);
      registerRefreshToken(user.id, refresh_token);
    } catch {
      /* ignore tracking errors */
    }
    return {
      message: "Password changed successfully",
      access_token,
      refresh_token,
    };
  }

  async refresh_token(token: string) {
    const REFRESH_KEY = process.env.REFRESH_KEY;
    if (!REFRESH_KEY) {
      throw new Error("Missing REFRESH_KEY");
    }
    try {
      // Reject revoked tokens
      const {
        isRefreshTokenRevoked,
        revokeRefreshToken,
        registerRefreshToken,
      } = await import("../utils/tokenBlacklist.js");
      if (isRefreshTokenRevoked(token)) {
        throw new Error("Invalid refresh token");
      }
      const decoded = jwt.verify(token, REFRESH_KEY, {
        algorithms: ["HS256"],
      }) as jwt.JwtPayload;
      const payload = {
        id: decoded.id,
        user_name: decoded.user_name,
        email: decoded.email,
        role: decoded.role,
        verified: decoded.verified,
      };
      const SECRET_KEY = process.env.SECRET_KEY;
      if (!SECRET_KEY) {
        throw new Error("Missing SECRET_KEY");
      }
      const access_token = jwt.sign(payload, SECRET_KEY, {
        expiresIn: "15m",
        algorithm: "HS256",
      });
      const refresh_token = jwt.sign(payload, REFRESH_KEY, {
        expiresIn: "7d",
        algorithm: "HS256",
      });
      // Revoke the old refresh token after rotation and register the new one
      revokeRefreshToken(token);
      registerRefreshToken(decoded.id as number, refresh_token);
      logAuthEvent({
        event: "auth.refresh",
        userId: decoded.id as number,
        email: decoded.email as string,
        success: true,
        correlationId: "service",
      });
      return { access_token, refresh_token };
    } catch (err) {
      logAuthEvent({
        event: "auth.refresh",
        success: false,
        reason: "Invalid refresh token",
        correlationId: "service",
      });
      throw new Error("Invalid refresh token");
    }
  }

  async has_profile_image(user: IUserRequest) {
    const u = await this.userRepository.get_user_by_id(user.id);
    return !!u.profile_image;
  }

  async create_profile_image(file: Express.Multer.File, user: IUserRequest) {
    if (await this.has_profile_image(user)) {
      throw new Error(
        "Profile image already exists, please use update instead",
      );
    }
    return this.upload_profile_image(file, user); // returns key
  }

  async upload_profile_image(file: Express.Multer.File, user: IUserRequest) {
    try {
      // Real validation from bytes
      const { mime } = await validateImageBuffer(file.buffer);
      const { key } = await this.s3Service.uploadFile(
        {
          buffer: file.buffer,
          mimetype: mime,
          originalname: file.originalname,
        },
        { role: user.role },
      );
      appLogger.info({ msg: "Uploaded image", key });
      await this.userRepository.upload_profile_image(user.id, {
        profile_image: key,
      });
      logDataChange({
        userId: user.id,
        entity: "user",
        entityId: user.id,
        operation: "update",
        changedFields: ["profile_image"],
        correlationId: "service",
      });
      return key;
    } catch (err) {
      throw new Error("Failed to upload image");
    }
  }


  async update_profile_image(file: Express.Multer.File, user: IUserRequest) {
    const existingUser = await this.userRepository.get_user_by_id(user.id);
    const oldProfileImage = existingUser.profile_image;
    if (!oldProfileImage) {
      throw new Error("Old profile image not found, please use upload instead");
    }
    const newKey = await this.upload_profile_image(file, user);
    try {
      //delete old image from s3
      if (!(await this.check_default_profile_image(oldProfileImage))) {
        await this.s3Service.deleteFile(oldProfileImage);
      }
    } catch (error: unknown) {
      appLogger.error({
        msg: "Failed to delete old profile image",
        error: (error as Error).message,
      });
      throw new Error("Failed to delete old profile image");
    }
    logDataChange({
      userId: user.id,
      entity: "user",
      entityId: user.id,
      operation: "update",
      changedFields: ["profile_image"],
      correlationId: "service",
    });
    return newKey;
  }

  async get_profile_image(user_id: number) {
    const user = await this.userRepository.get_user_by_id(user_id);
    if (!user.profile_image) {
      return null;
    }
    if (user.profile_image.startsWith("http")) {
      return user.profile_image; // already a URL from google OAuth
    }
    const imageUrl = await this.s3Service.getFileUrl(user.profile_image);
    return imageUrl;
  }

  async delete_profile_image(user_id: number) {
    const user = await this.userRepository.get_user_by_id(user_id);
    if (!user.profile_image) {
      throw new Error("No profile image found");
    }
    if (await this.check_default_profile_image(user.profile_image)) {
      throw new Error("Cannot delete default profile image");
    }
    try {
      await this.s3Service.deleteFile(user.profile_image);
      await this.userRepository.delete_profile_image(user_id);
      logDataChange({
        userId: user_id,
        entity: "user",
        entityId: user_id,
        operation: "update",
        changedFields: ["profile_image"],
        correlationId: "service",
      });
    } catch (error: unknown) {
      appLogger.error({
        msg: "Failed to delete profile image",
        error: (error as Error).message,
      });
      throw new Error("Failed to delete profile image");
    }
  }

  async create_user_profile(user_id: number, role: string) {
    // for oauth login user without profile created
    return await createProfileStrategy.create_user_profile(user_id, role);
  }

  async update_role(user_id: number, new_role: string) {
    const validRoles = getValidRoles();
    if (!validRoles.includes(new_role as Role)) {
      throw new Error("Invalid role");
    }

    try {
      // Update the user’s role in DB
      const updatedUser = await this.userRepository.update_role(
        user_id,
        new_role as Role,
      );
      if (!updatedUser) {
        throw new Error("Update failed, user not found");
      }

      // Create profile for the new role if it doesn't exist
      await this.create_user_profile(user_id, new_role);

      // Generate new JWT tokens
      const payload = {
        id: updatedUser.id,
        user_name: updatedUser.user_name,
        email: updatedUser.email,
        role: updatedUser.role,
        verified: updatedUser.verified,
      };

      const SECRET_KEY = process.env.SECRET_KEY;
      const REFRESH_KEY = process.env.REFRESH_KEY;
      if (!SECRET_KEY) {
        throw new Error("Missing SECRET_KEY");
      }
      if (!REFRESH_KEY) {
        throw new Error("Missing REFRESH_KEY");
      }

      const access_token = jwt.sign(payload, SECRET_KEY, {
        expiresIn: "15m",
        algorithm: "HS256",
      });
      const refresh_token = jwt.sign(payload, REFRESH_KEY, {
        expiresIn: "7d",
        algorithm: "HS256",
      });
      const response: LoginResponse = {
        id: updatedUser.id,
        access_token: access_token,
        refresh_token: refresh_token,
        user_name: updatedUser.user_name || "",
        role: updatedUser.role,
        email: updatedUser.email,
        verified: updatedUser.verified,
      };
      logDataChange({
        userId: updatedUser.id,
        entity: "user",
        entityId: updatedUser.id,
        operation: "update",
        changedFields: ["role"],
        correlationId: "service",
      });
      // Revoke previous sessions for fail-safe defaults
      try {
        const { revokeAllTokensForUser, registerRefreshToken } = await import(
          "../utils/tokenBlacklist.js"
        );
        revokeAllTokensForUser(updatedUser.id);
        registerRefreshToken(updatedUser.id, refresh_token);
      } catch { /* ignore */ }
      return response;
    } catch (err) {
      throw new Error("Failed to update role");
    }
  }


    async check_default_profile_image(profile_image_key: string){
        if (profile_image_key === DEFAULT_PROFILE_IMAGE_KEY) {
            return true;
        }
        return false;
    }

    async get_other_profile(user_id: number){
        const user = await this.userRepository.get_profile(user_id)
        return user
    }

    async get_company_profile(company_id: string){
        const company_id_num = Number(company_id)
        const company = await this.userRepository.get_company_profile(company_id_num)
        return company
    }

}
