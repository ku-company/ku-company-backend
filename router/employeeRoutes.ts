import { Router } from "express";
import { EmployeeController } from "../controller/employeeController.js";
import verifiedMiddleware from "../middlewares/verifiedMiddleware.js";
import authorizeRole from "../middlewares/rolebasedMiddleware.js";


const router = Router();
const employeeController = new EmployeeController();
router.use(verifiedMiddleware);
router.use(authorizeRole("Student", "Alumni", "Admin"));

// Manage employee profile
router.get("/my-profile", async (req , res) =>{
    employeeController.get_employee_profile(req, res)
})
router.post("/profile/create", async (req , res) =>{
    employeeController.create_profile(req, res)
})
router.patch("/my-profile/edit", async (req , res) => {
    employeeController.edit_profile(req, res)
})

router.delete("/my-profile/delete", async (req , res) => {
    employeeController.delete_profile(req,res)
})

//Apply job
router.post("/apply-job/:id", async(req , res) => {
    employeeController.apply_to_individual_job(req, res)
})

router.get("/my-resumes", async(req , res) => {
    employeeController.get_all_resumes(req, res)
})

router.delete("/cancel-application/:id", async(req , res) =>{
    employeeController.cancel_application(req, res)
})

router.get("/my-applications", async(req , res) => {
    employeeController.list_all_applications(req,res)
})

export default router;
