import { Router } from "express";
import { EmployeeController } from "../controller/employeeController.js";


const router = Router();
const employeeController = new EmployeeController();

router.get("/profile/:id", async (req , res) =>{
    employeeController.get_employee_profile(req, res)
})
router.post("/profile/create", async (req , res) =>{
    employeeController.create_profile(req, res)
})

export default router;
