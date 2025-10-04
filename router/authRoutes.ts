import { Router } from 'express';
import passport from 'passport';
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { UserOauth } from "../model/userModel.js";
import { AuthController } from '../controller/authController.js';

const router = Router();
const secretKey = process.env.SECRET_KEY;
const refreshKey = process.env.REFRESH_KEY;
const clientUrl = process.env.CLIENT_URL_DEV;

const authController = new AuthController();


if (!secretKey || !refreshKey || !clientUrl) {
  throw new Error("Missing required environment variables: SECRET_KEY, REFRESH_KEY, or CLIENT_URL_DEV");
}

router.get('/google', (req, res, next) => {
  const validRoles = ["Student", "Company", "Professor", "Alumni"];
  const role = req.query.role;
  const state = validRoles.includes(role as string) ? JSON.stringify({ role }) : JSON.stringify({});
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: state
  })(req, res, next);
});


router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/',
    session: false,
  }),
  (req: Request, res: Response) => {
    console.log("request user:",req.user)
    // issue JWT 
    const state = req.query.state ? JSON.parse(req.query.state as string) : {};
    const user = req.user as UserOauth;
    // Use DB role first (for login), fallback to state.role only for signup
    const role = user.role || state.role;

    if (!role) {
      console.error("Missing role for user:", user.email);
      return res.redirect(`${clientUrl}/error?reason=missing-role`);
    }

    const payload = {
      id: user.id,
      user_name: user.user_name || "",
      email: user.email,
      role: role,
      verified: user.verified
    }
    console.log("JWT Payload:", payload);

    const SECRET_KEY = process.env.SECRET_KEY;
    const REFRESH_KEY = process.env.REFRESH_KEY;
    if (!SECRET_KEY || !REFRESH_KEY || !clientUrl) {
      throw new Error("Missing required environment variables");
    }
    const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, REFRESH_KEY, { expiresIn: "7d" });
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // 15 min
    });
    res.redirect(clientUrl);
  },
);

router.get("/failure", (req: Request, res: Response) => {
  res.send("Authentication failed");
});

router.get("/me", (req: Request, res: Response) => {
  authController.getCurrentUser(req, res);
}
);

export default router;

