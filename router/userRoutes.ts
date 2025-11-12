import { Router } from "express"
import * as cookieParser from "cookie-parser";
import type { Request, Response } from "express"
import { UserController } from "../controller/userController.js";
import verifiedMiddleware from "../middlewares/verifiedMiddleware.js";
import { validationHandler } from "../middlewares/validationHandler.js";
import { signUpValidators, loginValidators, changePasswordValidators } from "../validators/userValidators.js";
import { param, body } from "express-validator";

const router = Router();
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
router.post(
    "/sign-up",
    authRateLimiter('sign-up'),
    signUpValidators,
    validationHandler,
    async (req: Request, res: Response) => {
    userController.sign_up(req, res)
});
router.post("/login",
        authRateLimiter('login'),
        loginValidators,
        validationHandler,
        async (req: Request, res: Response) => {
            userController.login(req,res)
        }
);

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
// Use POST for logout to avoid state-changing GET and align with KISS (method simplicity)
router.post("/logout", authRateLimiter('logout'), async (req, res) => {
    userController.logout(req, res)
})

router.patch("/role",
    authRateLimiter('role'),
    body("role").isString().withMessage("Invalid role"),
    validationHandler,
    async (req, res) => {
    userController.update_role(req, res)
})

router.get("/profile/:id",
    verifiedMiddleware,
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    async(req, res) =>{
    userController.get_profile(req, res)
})

export default router