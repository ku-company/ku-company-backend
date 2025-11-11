import { Router } from "express"
import { AdminController } from "../controller/adminController.js";
import authorizeRole from "../middlewares/rolebasedMiddleware.js";
import { param, body } from "express-validator";
import { validationHandler } from "../middlewares/validationHandler.js";


const router = Router();
const adminController = new AdminController()

router.patch("/verify-user/:id",
    authorizeRole("Admin"),
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    async (req , res) => { adminController.verify_user(req, res) }
)

router.patch("/reject-user/:id",
    authorizeRole("Admin"),
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    async (req , res) => { adminController.reject_user(req,res) }
)
router.patch("/edit-user-status/:id",
    authorizeRole("Admin"),
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    async (req , res) => { adminController.edit_user_status(req, res) }
)
router.patch("/edit-user-verified/:id",
    authorizeRole("Admin"),
    param("id").isInt().withMessage("Invalid id"),
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

router.post("/add-user", authorizeRole("Admin"), async (req , res) => {
    adminController.add_user(req, res)
})

router.get("/list-all-user", authorizeRole("Admin"), async ( req , res ) => {
    adminController.list_all_user(req, res)
})

router.get("/filtering-user", authorizeRole("Admin"), async ( req , res) => {
    adminController.filtering_user_by_status(req, res)
})


export default router