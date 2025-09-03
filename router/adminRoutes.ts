import { Router } from "express"
import { AdminController } from "../controller/adminController.js";
import authorizeRole from "../middlewares/rolebasedMiddleware.js";


const router = Router();
const adminController = new AdminController()

router.patch("/verify-user", authorizeRole("Admin") ,async (req , res) =>{
    adminController.verify_user(req, res)
})

router.patch("/reject-user", authorizeRole("Admin"), async (req , res) =>{
    adminController.reject_user(req,res)
})

export default router