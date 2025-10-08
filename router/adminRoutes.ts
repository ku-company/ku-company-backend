import { Router } from "express"
import { AdminController } from "../controller/adminController.js";
import authorizeRole from "../middlewares/rolebasedMiddleware.js";


const router = Router();
const adminController = new AdminController()

router.patch("/verify-user/:id", authorizeRole("Admin") ,async (req , res) =>{
    adminController.verify_user(req, res)
})

router.patch("/reject-user/:id", authorizeRole("Admin"), async (req , res) =>{
    adminController.reject_user(req,res)
})

router.delete("/delete-user/:id", authorizeRole("Admin"), async (req , res) =>{
    adminController.delete_user(req, res)
})

router.patch("/edit-user/:id", authorizeRole("Admin") , async (req , res) => {
    adminController.edit_user(req, res)
})

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