import { Router } from "express"
import { AIController } from "../controller/aiController.js";
import { param } from "express-validator";
import { validationHandler } from "../middlewares/validationHandler.js";


const router = Router();
/**
 * @swagger
 * tags:
 *   - name: AI
 *     description: AI verification endpoints (requires Admin)
 */
const aiController = new AIController();

// Simple in-memory rate limiter specific to AI verification route
// Window: 1 minute, Max: 20 requests per IP
interface RateRecord { count: number; firstTs: number; }
const aiRateStore: Map<string, RateRecord> = new Map();
const AI_WINDOW_MS = 60_000;
const AI_MAX_ATTEMPTS = 20;
function aiRateLimiter() {
    return (req: any, res: any, next: any) => {
        const ip = (req.ip || req.connection?.remoteAddress || 'unknown');
        const key = `ai-verify:${ip}`;
        const now = Date.now();
        const record = aiRateStore.get(key);
        if (!record) {
            aiRateStore.set(key, { count: 1, firstTs: now });
            return next();
        }
        if (now - record.firstTs > AI_WINDOW_MS) {
            aiRateStore.set(key, { count: 1, firstTs: now });
            return next();
        }
        record.count += 1;
        if (record.count > AI_MAX_ATTEMPTS) {
            const retryAfter = Math.ceil((record.firstTs + AI_WINDOW_MS - now) / 1000);
            res.setHeader('Retry-After', String(retryAfter));
            return res.status(429).json({ message: 'Too many requests. Please wait before retrying.' });
        }
        next();
    };
}

router.post("/verify-user/:id",
    aiRateLimiter(), // ensure rate limiting for verification route
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    async (req , res) => {
        aiController.verify_user(req, res)
})

/**
 * @swagger
 * /api/ai/verify-user/{id}:
 *   post:
 *     summary: Trigger AI verification for a user by ID
 *     tags: [AI]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Verification completed
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Error verifying user
 */


export default router;