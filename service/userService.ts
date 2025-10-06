import { UserRepository } from "../repository/userRepository.js"
import type { sign_up_input, UserDB, Login, sign_up_company_input, IUserRequest } from "../model/userModel.js";
import type { UserDTO, LoginResponse, RefreshTokenRequest, UserCompanyDTO } from "../dtoModel/userDTO.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { SignUpStrategyFactory, SignUpStrategy } from "../helper/signupStrategy.js";
import { S3Service } from "../service/s3Services.js";
import { validateImageBuffer } from "../helper/image.js";
import { ImageKeyStrategy } from "../helper/s3KeyStrategy.js"
import { Role } from "../utils/enums.js";
import { getValidRoles } from "../utils/roleUtils.js";


export class UserService {
    
    private userRepository: UserRepository;
    private s3Service: S3Service;
    private BUCKET_NAME = process.env.BUCKET_NAME || "";

    constructor() {
        this.userRepository = new UserRepository()
        this.s3Service = new S3Service(this.BUCKET_NAME, new ImageKeyStrategy());
    }
    
    async sign_up(input: sign_up_input){
        if(input.password !== input.confirm_password){
            throw new Error("Password and Confirm password do not match")   
        }
        if(input.email.length < 5 || !input.email.includes("@")){
            throw new Error("Invalid email")
        }
        if(await this.userRepository.is_valid_create_user(input.user_name, input.email, input.company_name)){
            let strategy: SignUpStrategy = SignUpStrategyFactory.setStrategy(input.role);
            const userData: UserDB = await strategy.create_user(this.userRepository, input);
            const response = await strategy.sign_up(userData);
            return response
        }
    }

    async login(input: Login){
        if(!input.user_name || !input.password){
            throw new Error("Missing username or password")
        }
        const is_valid = await this.userRepository.is_valid_user(input.user_name, input.password);
        if(!is_valid){
            throw new Error("Invalid username or password")
        }
        const user = await this.userRepository.get_user_by_userName(input.user_name);
        const payload = {
            id: user.id,
            user_name: user.user_name,
            email: user.email,
            role: user.role,
            verified: user.verified
        }
        const SECRET_KEY= process.env.SECRET_KEY;
        const REFRESH_KEY = process.env.REFRESH_KEY;
        if(!SECRET_KEY){
            throw new Error("Missing SECRET_KEY")
        }
        if(!REFRESH_KEY){
            throw new Error("Missing REFRESH_KEY")
        }
        const access_token = jwt.sign(payload, SECRET_KEY, {expiresIn: "15m"});
        const refresh_token = jwt.sign(payload, REFRESH_KEY, {expiresIn: "7d"});

        const response: LoginResponse = {
            "id": user.id,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user_name": user.user_name || "",
            "role": user.role,
            "email": user.email,
            "verified": user.verified
        }
        return response
    }

    async refresh_token(token: string){
        const REFRESH_KEY = process.env.REFRESH_KEY;
        if(!REFRESH_KEY){
            throw new Error("Missing REFRESH_KEY")
        }
        try{
            const decoded = jwt.verify(token, REFRESH_KEY) as jwt.JwtPayload;
            const payload = {
                id: decoded.id,
                user_name: decoded.user_name,
                email: decoded.email,
                role: decoded.role,
                verified: decoded.verified
            }
            const SECRET_KEY= process.env.SECRET_KEY;
            if(!SECRET_KEY){
                throw new Error("Missing SECRET_KEY")
            }
            const access_token = jwt.sign(payload, SECRET_KEY, {expiresIn: "15m"});
            const response = {
                "access_token": access_token
            }
            return response
        }catch(err){
            throw new Error("Invalid refresh token")
        }
    }

    async has_profile_image(user: IUserRequest){
        const u = await this.userRepository.get_user_by_id(user.id);
        return !!u.profile_image;
    }

    async create_profile_image(file: Express.Multer.File, user: IUserRequest) {
        if (await this.has_profile_image(user)) {
                throw new Error("Profile image already exists, please use update instead");
        }
        return this.upload_profile_image(file, user); // returns key
    }

    async upload_profile_image(file: Express.Multer.File, user: IUserRequest){
        try{
            // Real validation from bytes
            const { mime } = await validateImageBuffer(file.buffer);
            const { key} = await this.s3Service.uploadFile({
                buffer: file.buffer,
                mimetype: mime,
                originalname: file.originalname,
                },
                {role: user.role}
            );
            console.log("Uploaded image path:", key);
            await this.userRepository.upload_profile_image(user.id, { profile_image: key });
            return key;
        }catch(err){
            throw new Error("Failed to upload image");
        }
    }

    async update_profile_image(file: Express.Multer.File, user: IUserRequest){
        const existingUser = await this.userRepository.get_user_by_id(user.id);
        const oldProfileImage = existingUser.profile_image;
        if(!oldProfileImage){
            throw new Error("Old profile image not found, please use upload instead");
        }
        const newKey = await this.upload_profile_image(file, user);
        try{
            //delete old image from s3
            await this.s3Service.deleteFile(oldProfileImage);
        }catch(error: unknown){
            console.error((error as Error).message);
            throw new Error("Failed to delete old profile image");
        }
        return newKey;    
    }

    async get_profile_image(user_id: number){
        const user = await this.userRepository.get_user_by_id(user_id);
        if(!user.profile_image){
            return null;
        }
        if(user.profile_image.startsWith("http")){
            return user.profile_image; // already a URL from google OAuth
        }
        const imageUrl = await this.s3Service.getFileUrl(user.profile_image);
        return imageUrl;
    }

    async delete_profile_image(user_id: number){
        const user = await this.userRepository.get_user_by_id(user_id);
        if(!user.profile_image){
            throw new Error("No profile image found");
        }
        try{
            await this.s3Service.deleteFile(user.profile_image);
            await this.userRepository.delete_profile_image(user_id);
        }catch(error: unknown){
            console.error((error as Error).message);
            throw new Error("Failed to delete profile image");
        }
    }

    async update_role(user_id: number, new_role: string){
        const validRoles = getValidRoles();
        // const validRoles = Object.values(Role).filter(r => r !== Role.Admin) as Role[];
        if (!validRoles.includes(new_role as Role)) {
        throw new Error("Invalid role");
        }

        try{
            const updatedUser = await this.userRepository.update_role(user_id, new_role as Role);
            const payload = {
                id: updatedUser.id,
                user_name: updatedUser.user_name,
                email: updatedUser.email,
                role: updatedUser.role,
                verified: updatedUser.verified
            }

            const SECRET_KEY= process.env.SECRET_KEY;
            const REFRESH_KEY = process.env.REFRESH_KEY;
            if(!SECRET_KEY){
                throw new Error("Missing SECRET_KEY")
            }
            if(!REFRESH_KEY){
                throw new Error("Missing REFRESH_KEY")
            }
            
            const access_token = jwt.sign(payload, SECRET_KEY, {expiresIn: "15m"});
            const refresh_token = jwt.sign(payload, REFRESH_KEY, {expiresIn: "7d"});
            const response: LoginResponse = {
                "id": updatedUser.id,
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user_name": updatedUser.user_name || "",
                "role": updatedUser.role,
                "email": updatedUser.email,
                "verified": updatedUser.verified

            }
            return response;

        }catch(err){
            throw new Error("Failed to update role");
        }
    }

}