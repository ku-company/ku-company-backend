import type { Request, Response } from "express";
import { UserService } from "../service/userService.js";
import { logAuthEvent } from "../utils/logger.js";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async sign_up(req: Request, res: Response) {
    try {
      const result = await this.userService.sign_up(req.body);
      logAuthEvent({
        event: "auth.signup",
        success: true,
        email: req.body?.email,
        ip: req.ip || "",
        correlationId: (req as any).correlationId || "no-corr",
      });
      res.status(201).json({
        message: "User created successfully",
        data: result,
      });
    } catch (error: any) {
      logAuthEvent({
        event: "auth.signup",
        success: false,
        reason: error.message,
        email: req.body?.email,
        ip: req.ip || "",
        correlationId: (req as any).correlationId || "no-corr",
      });
      res.status(400).json({
        message: error.message,
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await this.userService.login(req.body);
      const { setAuthCookies } = await import("../utils/cookies.js");
      setAuthCookies(res, result.access_token, result.refresh_token);
      res.status(200).json({
        message: "Login successful",
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        message: error.message,
      });
    }
  }

  async change_password(
    user_id: number,
    current_password: string,
    new_password: string,
  ) {
    const result = await this.userService.change_password(
      user_id,
      current_password,
      new_password,
    );
    return result;
  }

  async refresh_token(req: Request, res: Response) {
    try {
      const token =
        (await (async () => {
          const raw = (req as any).cookies?.refresh_token;
          if (!raw) return undefined;
          const { decryptCookieValue } = await import("../utils/cookies.js");
          return decryptCookieValue(raw) || raw;
        })()) ||
        (req.body && (req.body as any).refresh_token);
      if (!token) {
        return res.status(400).json({ message: "Missing refresh token" });
      }
      const result = await this.userService.refresh_token(token);
      const { setAuthCookies } = await import("../utils/cookies.js");
      setAuthCookies(res, result.access_token, result.refresh_token);
      res
        .status(200)
        .json({
          message: "Token refreshed successfully",
          data: { access_token: result.access_token },
        });
    } catch (error: any) {
      res.status(400).json({
        message: error.message,
      });
    }
  }
  async logout(req: Request, res: Response) {
    try {
      const refresh = await (async () => {
        const raw = (req as any).cookies?.refresh_token;
        if (!raw) return undefined;
        const { decryptCookieValue } = await import("../utils/cookies.js");
        return decryptCookieValue(raw) || raw;
      })();
      if (refresh) {
        const { revokeRefreshToken } = await import(
          "../utils/tokenBlacklist.js"
        );
        revokeRefreshToken(refresh);
      }
      const { clearAuthCookies } = await import("../utils/cookies.js");
      clearAuthCookies(res);
      logAuthEvent({
        event: "auth.logout",
        success: true,
        userId: (req as any).user?.id,
        email: (req as any).user?.email,
        ip: req.ip || "",
        correlationId: (req as any).correlationId || "no-corr",
      });
      logAuthEvent({
        event: "auth.logout",
        success: true,
        userId: (req as any).user?.id,
        email: (req as any).user?.email,
        reason: "Revocation failed but cookies cleared",
        ip: req.ip || "",
        correlationId: (req as any).correlationId || "no-corr",
      });
      res.status(200).json({ message: "Logout successful" });
    } catch (err) {
      // Even if revocation fails, attempt to clear cookies and return success to avoid leaking token presence
      const { clearAuthCookies } = await import("../utils/cookies.js");
      clearAuthCookies(res);
      res.status(200).json({ message: "Logout successful" });
    }
  }

  async upload_profile_image(req: Request, res: Response) {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    try {
      const user = req.user as { id: number; role: string };
      const imageUrl = await this.userService.create_profile_image(
        req.file,
        user,
      );
      res.json({ message: "Image uploaded successfully", imageUrl });
    } catch (error: unknown) {
      console.error((error as Error).message);
      res.status(500).json({ message: (error as Error).message });
    }
  }
  
  async update_profile_image(req: Request, res: Response) {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    try {
      const user = req.user as { id: number; role: string };
      const imageUrl = await this.userService.update_profile_image(
        req.file,
        user,
      );
      res.json({ message: "Profile image updated successfully", imageUrl });
    } catch (error: unknown) {
      console.error((error as Error).message);
      res.status(500).json({ message: (error as Error).message });
    }
  }


  async get_profile_image(req: Request, res: Response) {
    try {
      const user = req.user as { id: number };
      const imageUrl = await this.userService.get_profile_image(user.id);
      res.json({ profile_image: imageUrl });
    } catch (error: unknown) {
      console.error((error as Error).message);
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async delete_profile_image(req: Request, res: Response) {
    try {
      const user = req.user as { id: number };
      await this.userService.delete_profile_image(user.id);
      res.json({ message: "Profile image deleted successfully" });
    } catch (error: unknown) {
      console.error((error as Error).message);
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async update_role(req: Request, res: Response) {
    try {
      const user = req.user as { id: number; role: string };
      const role = req.body.role as string;
      // Revoke existing refresh token (if any) before issuing new tokens
      const oldRefresh = await (async () => {
        const raw = (req as any).cookies?.refresh_token;
        if (!raw) return undefined;
        const { decryptCookieValue } = await import("../utils/cookies.js");
        return decryptCookieValue(raw) || raw;
      })();
      if (oldRefresh) {
        const { revokeRefreshToken } = await import(
          "../utils/tokenBlacklist.js"
        );
        revokeRefreshToken(oldRefresh);
      }
      const result = await this.userService.update_role(user.id, role);
      const { setAuthCookies } = await import("../utils/cookies.js");
      setAuthCookies(res, result.access_token, result.refresh_token);
      res.status(200).json({
        message: "Role updated successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        message: error.message,
      });
    }
  }

  async get_profile(req: Request, res: Response) {
    try {
      const user_id = Number(req.params.id);
      const result = await this.userService.get_other_profile(user_id);
      res.status(200).json({
        message: "Profile retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        message: error.message,
      });
    }
  }

    async get_company_profile(req: Request, res: Response){
        try{
            const result = await this.userService.get_company_profile(req.params.id!);
            console.log(result)
            res.status(200).json({
                message: "Company profile retrieved successfully",
                data: result
            })
        }catch(error: any){
            res.status(400).json({
                message: error.message
            })
        }
    }

    



  
}
