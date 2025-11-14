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
router.patch("/edit-user-status/:id", authorizeRole("Admin"), async (req , res) =>{
    adminController.edit_user_status(req, res)
})
router.patch("/edit-user-verified/:id", authorizeRole("Admin"), async (req , res) =>{
    adminController.edit_user_verified(req, res)
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

router.get("/list-all-job-posting", authorizeRole("Admin"), async ( req , res) => {
    adminController.list_all_jobPosting(req, res)
})

router.get("/job-posting/:id", authorizeRole("Admin"), async ( req , res) => {
    adminController.get_jobPosting_by_id(req, res)
})

router.get("/filtering-job-posting", authorizeRole("Admin"), async ( req , res) => {
    adminController.list_filtering_jobPosting(req, res)
})

router.delete("/delete-job-posting/:id", authorizeRole("Admin"), async ( req , res) => {
    adminController.delete_jobPosting(req, res)
})

router.patch("/edit-job-posting-verified/:id", authorizeRole("Admin"), async ( req , res) => {
    adminController.edit_jobPosting_verified(req, res)
})

export default router