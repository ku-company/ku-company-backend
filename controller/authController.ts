import type { Request, Response } from "express";
import type { NextFunction } from "express";
// import authService from "../services/authService";
import passport from "passport";

export class AuthController {
    constructor(){}
  // Initiates Google OAuth
    async googleLogin(req: Request, res: Response, next: NextFunction) {
        passport.authenticate("google", { scope: ["email", "profile"] })(req, res, next);
    }

    // Handles callback
    async googleCallback(req: Request, res: Response, next: NextFunction) {
        passport.authenticate("google", { failureRedirect: "/auth/failure" })(
        req,
        res,
        async (err) => {
            if (err) return next(err);
            // After successful login, do business logic
            // await authService.createOrUpdateUser(req.user);
            res.redirect("/protected");
        }
        );
    }

    async authFailure(req: Request, res: Response) {
        res.send("Authentication failed");
    }
}

