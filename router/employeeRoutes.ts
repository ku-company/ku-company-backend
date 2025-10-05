import { Router } from "express";
import { EmployeeController } from "../controller/employeeController.js";
import verifiedMiddleware from "../middlewares/verifiedMiddleware.js";
import authorizeRole from "../middlewares/rolebasedMiddleware.js";
import {uploadPdf } from "../middlewares/uploadPdfMiddleware.js";
import { uploadImage } from "../middlewares/uploadImageMiddleware.js";
import type { Request, Response } from "express";
import { UserController } from "../controller/userController.js";

const router = Router();
const employeeController = new EmployeeController();
const userController = new UserController();
router.use(verifiedMiddleware);
router.use(authorizeRole("Student", "Alumni", "Admin"));

router.post(
  "/profile/image",
  uploadImage.single("profile_image"),
  async (req: Request, res: Response) => {
    userController.upload_profile_image(req, res);
});

router.get("/profile/image", async (req: Request, res: Response) => {
  userController.get_profile_image(req, res);
});

router.patch("/profile/image", uploadImage.single("profile_image"), async (req: Request, res: Response) => {
  //update profile image
  userController.update_profile_image(req, res);
});

router.delete("/profile/image", async (req: Request, res: Response) => {
  //delete profile image
  userController.delete_profile_image(req, res);
});

router.get("/profile/resumes", (req, res) => {
  employeeController.get_resumes(req, res);
});

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

router.post("/profile/upload-resumes", uploadPdf.array("resume", 3), async (req, res) => {
    // can upload max 3 resume files
    console.log(req.files);
    employeeController.upload_resumes(req, res);
})

export default router;
