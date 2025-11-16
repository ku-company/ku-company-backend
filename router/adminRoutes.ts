import { Router } from "express"
import { AdminController } from "../controller/adminController.js";
import authorizeRole from "../middlewares/rolebasedMiddleware.js";
import { param, body } from "express-validator";
import { validationHandler } from "../middlewares/validationHandler.js";
import { addUserValidators, editUserStatusValidators, editUserVerifiedValidators, filterUsersValidators } from "../validators/adminValidators.js";
import rateLimit from "express-rate-limit";


const router = Router();
/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin management endpoints (requires Admin role)
 */
// Apply a rate limiter to all admin routes (defense-in-depth against abuse)
const adminLimiter = rateLimit({
    windowMs: Number(process.env.ADMIN_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000), // 15 minutes default
    max: Number(process.env.ADMIN_RATE_LIMIT_MAX ?? 100), // limit each user/IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: any) => String(req?.user?.id ?? req.ip ?? 'unknown'),
    handler: (_req, res) => res.status(429).json({ message: 'Too many admin requests. Please try again later.' })
});
// Limit before any specific admin handlers
router.use(adminLimiter);
const adminController = new AdminController()

router.patch("/verify-user/:id",
    authorizeRole("Admin"),
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    async (req , res) => { adminController.verify_user(req, res) }
)
/**
 * @swagger
 * /api/admin/verify-user/{id}:
 *   patch:
 *     summary: Verify a user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User verified
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

router.patch("/reject-user/:id",
    authorizeRole("Admin"),
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    async (req , res) => { adminController.reject_user(req,res) }
)
router.patch("/edit-user-status/:id",
    authorizeRole("Admin"),
    param("id").isInt().withMessage("Invalid id"),
    ...editUserStatusValidators,
    validationHandler,
    async (req , res) => { adminController.edit_user_status(req, res) }
)
router.patch("/edit-user-verified/:id",
    authorizeRole("Admin"),
    param("id").isInt().withMessage("Invalid id"),
    ...editUserVerifiedValidators,
    validationHandler,
    async (req , res) => { adminController.edit_user_verified(req, res) }
)

router.delete("/delete-user/:id",
    authorizeRole("Admin"),
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    async (req , res) => { adminController.delete_user(req, res) }
)

router.patch(
    "/edit-user/:id",
    authorizeRole("Admin"),
    param("id").isInt().withMessage("Invalid id"),
    body("first_name").optional({ nullable: true }).isString().trim().withMessage("Invalid first_name"),
    body("last_name").optional({ nullable: true }).isString().trim().withMessage("Invalid last_name"),
    body("user_name").optional({ nullable: true }).isString().trim().withMessage("Invalid user_name"),
    body("email").optional({ nullable: true }).isEmail().withMessage("Invalid email"),
    body("role").optional({ nullable: true }).isString().trim().withMessage("Invalid role"),
    validationHandler,
    async (req , res) => { adminController.edit_user(req, res) }
)

router.post("/add-user",
    authorizeRole("Admin"),
    ...addUserValidators,
    validationHandler,
    async (req , res) => {
        adminController.add_user(req, res)
})

router.get("/list-all-user", authorizeRole("Admin"), async ( req , res ) => {
    adminController.list_all_user(req, res)
})

router.get("/filtering-user",
    authorizeRole("Admin"),
    ...filterUsersValidators,
    validationHandler,
    async ( req , res) => {
        adminController.filtering_user_by_status(req, res)
})


export default router