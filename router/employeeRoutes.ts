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

router.post("/profile/resumes", uploadPdf.array("resume", 3), async (req, res) => {
    // can upload max 3 resume files
    employeeController.upload_resumes(req, res);
})

router.get("/profile/resumes", (req, res) => {
    // get list of resumes
    employeeController.get_resumes(req, res);
});

router.get("/profile/resume/:id", (req, res) => {
    // get specific resume by id
    employeeController.get_resume(req, res);
});

router.delete("/profile/resume/:id", (req, res) => {
    // delete specific resume by id
    employeeController.delete_resume(req, res);
});

router.delete("/profile/resumes", (req, res) => {
    // delete all resumes
    employeeController.delete_all_resumes(req, res);
});

router.patch("/profile/resume/:id/set-main", (req, res) => {
    // set specific resume as main
  employeeController.set_main_resume(req, res);
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


export default router;
