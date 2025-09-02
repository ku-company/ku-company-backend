import type { Request, Response } from "express";
import { UserService } from "../service/userService.js";

export class UserController {

    private userService: UserService;

    constructor(){
        this.userService = new UserService()
    }

    async sign_up(req: Request, res: Response){
        try {
            const result = await this.userService.sign_up(req.body);
            console.log(result)
            res.status(201).json({
                message: "User created successfully",
                data: result
            })
        }
        catch (error: any){
            res.status(400).json({
                message: error.message
            })
        }
    }


    async login(req: Request, res: Response){
        try {
            const result = await this.userService.login(req.body);
            res.cookie("access_token", result.access_token, { httpOnly: true, maxAge: 15*60*1000 });
            res.cookie("refresh_token", result.refresh_token, { httpOnly: true, maxAge: 7*24*60*60*1000 });
            res.status(200).json({
                message: "Login successful",
                data: result
            })
        }
        catch (error: any){
            res.status(400).json({
                message: error.message
            })
        }
    }
    
    async refresh_token(req: Request, res: Response){
        try {
            const result = await this.userService.refresh_token(req.cookies.refresh_token);;
            res.status(200).json({
                message: "Token refreshed successfully",
                data: result
            })
        }
        catch (error: any){
            res.status(400).json({
                message: error.message
            })
        }
    }
    async logout(req: Request, res: Response){
        res.clearCookie('access_token')
        res.status(200).json({
            message: "Logout successful"
        })
    }


}