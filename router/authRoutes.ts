import { Router } from 'express';
import passport from 'passport';
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { UserOauth } from "../model/userModel.js";

const router = Router();
const secretKey = process.env.SECRET_KEY;
const refreshKey = process.env.REFRESH_KEY;
const clientUrl = process.env.CLIENT_URL_DEV;

if (!secretKey || !refreshKey || !clientUrl) {
  throw new Error("Missing required environment variables: SECRET_KEY, REFRESH_KEY, or CLIENT_URL_DEV");
}

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/',
    session: false,
  }),
  (req: Request, res: Response) => {
    console.log(3333,req.user)
    // issue JWT 
    const user = req.user as UserOauth;
    const payload = {
      id: user.id,
      user_name: user.user_name || "",
      email: user.email,
      roles: user.roles
    }
    console.log("JWT Payload:", payload);

    const accessToken = jwt.sign(payload, process.env.SECRET_KEY!, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_KEY!, { expiresIn: "7d" });
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

export default router;

