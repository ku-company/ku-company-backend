import { Router } from 'express';
// ESM/CJS interop: passport may be a default export or namespace
import * as passportNS from 'passport';
const passportLib: any = (passportNS as any).default || (passportNS as any);
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { UserOauth } from "../model/userModel.js";
import { AuthController } from '../controller/authController.js';
import { getValidRoles } from '../utils/roleUtils.js';
import { Role } from '../utils/enums.js';
const router = Router();
// CORS-safe client URL for redirects; validate against allowlist when provided
const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL_DEV || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const clientUrl = ((): string => {
  const url = process.env.CLIENT_URL_DEV as string | undefined;
  if (!url) return '';
  if (allowedOrigins.length === 0 || allowedOrigins.includes(url)) return url;
  console.warn("CLIENT_URL_DEV not in ALLOWED_ORIGINS; falling back to first allowed origin");
  return allowedOrigins[0] || url;
})();
const authController = new AuthController();
/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication via Google OAuth and token utilities
 */


router.get('/google', (req, res, next) => {
  const validRoles = getValidRoles();
  const role = req.query.role;
  const stdId = req.query.stdId; // only relevant for students
  
  const state: Record<string, any> = {};
  if (validRoles.includes(role as Role)) state.role = role;
  if ((role === Role.Student || role === Role.Alumni) && stdId) state.stdId = stdId;

  passportLib.authenticate('google', {
    scope: ['profile', 'email'],
    state: JSON.stringify(state),
  })(req, res, next);
});
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user from token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */


router.get(
  '/google/callback',
  passportLib.authenticate('google', {
    failureRedirect: '/',
    session: false,
  }),
  async (req: Request, res: Response) => {
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
  const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "15m", algorithm: "HS256" });
  const refreshToken = jwt.sign(payload, REFRESH_KEY, { expiresIn: "7d", algorithm: "HS256" });
    // Fail-safe: revoke all existing sessions for this user before registering new refresh
    try {
      const { revokeAllTokensForUser, registerRefreshToken } = await import('../utils/tokenBlacklist.js');
      revokeAllTokensForUser(user.id);
      registerRefreshToken(user.id, refreshToken);
    } catch {/* ignore tracking errors */}
    const { setAuthCookies } = await import('../utils/cookies.js');
    setAuthCookies(res, accessToken, refreshToken);
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

