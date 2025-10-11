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

router.use(authorizeRole("Student", "Alumni", "Admin"));
router.post("/my-profile/create", async (req , res) =>{
    employeeController.create_profile(req, res)
})
router.use(verifiedMiddleware);

// === Profile Image Routes ===
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

// === Resume Routes ===
router.post("/profile/resumes", uploadPdf.array("resume", 3), async (req, res) => {
    // can upload max 3 resume files
    employeeController.upload_resumes(req, res);
})

router.get("/profile/resumes", (req, res) => {
    // get list of resumes
    employeeController.get_resumes(req, res);
});

router.get("/profile/resumes/main", (req, res) => {
    // get main resume
    employeeController.get_main_resume(req, res);
});

router.get("/profile/resumes/:id", (req, res) => {
    // get specific resume by id
    employeeController.get_resume(req, res);
});

router.delete("/profile/resumes/:id", (req, res) => {
    // delete specific resume by id
    employeeController.delete_resume(req, res);
});

router.delete("/profile/resumes", (req, res) => {
    // delete all resumes
    employeeController.delete_all_resumes(req, res);
});

router.patch("/profile/resumes/:id/set-main", (req, res) => {
    // set specific resume as main
  employeeController.set_main_resume(req, res);
});

// === Employee Profile Routes ===
// Manage employee profile
router.get("/my-profile", async (req , res) =>{
    employeeController.get_employee_profile(req, res)
})
router.post("/my-profile/create", async (req , res) =>{
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

router.post("/checkout/apply-jobs", async(req , res) => {
    employeeController.checkout_list_apply_job(req, res)
})

router.post("/job-applications/:id/confirm", async(req , res) =>{
    employeeController.sent_the_confirmation_to_company(req, res)
})
export default router;
