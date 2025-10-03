import { Router } from "express";
import { EmployeeController } from "../controller/employeeController.js";
import verifiedMiddleware from "../middlewares/verifiedMiddleware.js";
import authorizeRole from "../middlewares/rolebasedMiddleware.js";


const router = Router();
const employeeController = new EmployeeController();
router.use(verifiedMiddleware);
router.use(authorizeRole("Student", "Alumni","Admin"));

router.get("/profile/:id", async (req , res) =>{
    employeeController.get_employee_profile(req, res)
})
router.post("/profile/create", async (req , res) =>{
    employeeController.create_profile(req, res)
})
router.patch("/profile/edit/:id", async (req , res) => {
    employeeController.edit_profile(req, res)
})

router.delete("/profile/delete/:id", async (req , res) => {
    employeeController.delete_profile(req,res)
})

export default router;
