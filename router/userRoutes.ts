import { Router } from "express"
import * as cookieParser from "cookie-parser";
import type { Request, Response } from "express"
import { UserController } from "../controller/userController.js";
import verifiedMiddleware from "../middlewares/verifiedMiddleware.js";
import { validationHandler } from "../middlewares/validationHandler.js";
import { signUpValidators, loginValidators, changePasswordValidators } from "../validators/userValidators.js";
import { param, body } from "express-validator";

const router = Router();
/**
 * @swagger
 * tags:
 *   - name: User
 *     description: User authentication and profile endpoints
 */
// Support both CJS and ESM interop for cookie-parser
const cookieParserMw = (cookieParser as any).default ?? (cookieParser as any);
router.use(cookieParserMw());

// Simple in-memory rate limiter (IP + route key). For production, replace with Redis or robust store.
interface RateRecord { count: number; firstTs: number; }
const rateStore: Map<string, RateRecord> = new Map();
const WINDOW_MS = 60_000; // 1 minute window
const MAX_ATTEMPTS = 10; // allow 10 attempts per window

function authRateLimiter(routeKey: string) {
    return (req: Request, res: Response, next: Function) => {
        const ip = (req.ip || req.connection.remoteAddress || 'unknown');
        const key = `${routeKey}:${ip}`;
        const now = Date.now();
        const record = rateStore.get(key);
        if (!record) {
            rateStore.set(key, { count: 1, firstTs: now });
            return next();
        }
        if (now - record.firstTs > WINDOW_MS) {
            // reset window
            rateStore.set(key, { count: 1, firstTs: now });
            return next();
        }
        record.count += 1;
        if (record.count > MAX_ATTEMPTS) {
            const retryAfter = Math.ceil((record.firstTs + WINDOW_MS - now) / 1000);
            res.setHeader('Retry-After', String(retryAfter));
            return res.status(429).json({ message: 'Too many requests. Please wait before retrying.' });
        }
        next();
    };
}
const userController = new UserController()

router.post("/refresh-token",
        authRateLimiter('refresh-token'),
        async (req, res) => {
            userController.refresh_token(req, res)
        }
)
/**
 * @swagger
 * /api/user/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token cookie
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Token refreshed
 *       429:
 *         description: Too many requests
 */
router.post(
    "/sign-up",
    authRateLimiter('sign-up'),
    signUpValidators,
    validationHandler,
    async (req: Request, res: Response) => {
    userController.sign_up(req, res)
});
/**
 * @swagger
 * /api/user/sign-up:
 *   post:
 *     summary: Sign up a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error
 *       429:
 *         description: Too many requests
 */
router.post("/login",
        authRateLimiter('login'),
        loginValidators,
        validationHandler,
        async (req: Request, res: Response) => {
            userController.login(req,res)
        }
);
/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Login with email/credentials
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Logged in
 *       400:
 *         description: Validation error
 *       429:
 *         description: Too many requests
 */

router.patch("/password",
    authRateLimiter('password'),
    changePasswordValidators,
    validationHandler,
    async (req: Request, res: Response) => {
        try {
            const user = req.user as { id: number };
            const { current_password, new_password } = req.body;
            const result = await userController.change_password(user.id, current_password, new_password)
            const { setAuthCookies } = await import("../utils/cookies.js");
            setAuthCookies(res, result.access_token, result.refresh_token);
            res.status(200).json({ message: result.message });
        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    }
);
/**
 * @swagger
 * /api/user/password:
 *   patch:
 *     summary: Change current user's password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               current_password: { type: string }
 *               new_password: { type: string }
 *             required: [current_password, new_password]
 *     responses:
 *       200:
 *         description: Password changed
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Too many requests
 */
// Use POST for logout to avoid state-changing GET and align with KISS (method simplicity)
router.post("/logout", authRateLimiter('logout'), async (req, res) => {
    userController.logout(req, res)
})
/**
 * @swagger
 * /api/user/logout:
 *   post:
 *     summary: Logout current user (clears cookies)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Too many requests
 */

router.patch("/role",
    authRateLimiter('role'),
    body("role").isString().withMessage("Invalid role"),
    validationHandler,
    async (req, res) => {
    userController.update_role(req, res)
})
/**
 * @swagger
 * /api/user/role:
 *   patch:
 *     summary: Update current user's role (admin-only in practice)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role: { type: string }
 *             required: [role]
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

router.get("/profile/:id",
    verifiedMiddleware,
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    async(req, res) =>{
    userController.get_profile(req, res)
})
/**
 * @swagger
 * /api/user/profile/{id}:
 *   get:
 *     summary: Get user profile by id (verified users)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Profile retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

router.get("/company-profile/:id", verifiedMiddleware, async(req , res ) => {
    userController.get_company_profile(req, res)
})

export default router