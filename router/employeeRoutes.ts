import { Router } from "express";
import { EmployeeController } from "../controller/employeeController.js";
import verifiedMiddleware from "../middlewares/verifiedMiddleware.js";
import authorizeRole from "../middlewares/rolebasedMiddleware.js";
import {upload} from "../middlewares/uploadPdfMiddleware.js";


const router = Router();
const employeeController = new EmployeeController();
router.use(verifiedMiddleware);
router.use(authorizeRole("Student", "Alumni", "Admin"));

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

router.post("/profile/upload-resume",upload.array("resume", 3), async (req, res) => {
    // can upload max 3 resume files
    // To be implemented
    console.log(req.files);
    res.status(200).json({message: "Resume uploaded successfully"})
})

export default router;
