import type { Request, Response } from "express";
import { AuthService } from "../service/authSevice.js";

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }


    async getCurrentUser(req: Request, res: Response) {
        try {
            const token = req.headers.authorization?.split(" ")[1] || req.cookies.access_token;
            const user = await this.authService.getCurrentUser(token);
            res.status(200).json(user);
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: "Unauthorized" });
        }
    }


    
}