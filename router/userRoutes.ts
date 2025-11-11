import { Router } from "express"
import type { Request, Response } from "express"
import { UserController } from "../controller/userController.js";
import verifiedMiddleware from "../middlewares/verifiedMiddleware.js";
import { validationHandler } from "../middlewares/validationHandler.js";
import { signUpValidators, loginValidators } from "../validators/userValidators.js";
import { param, body } from "express-validator";

const router = Router();

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
router.post("/sign-up", signUpValidators, validationHandler, async (req: Request, res: Response) => {
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
router.get("/logout", async (req, res) => {
    userController.logout(req, res)
})

router.patch("/role",
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