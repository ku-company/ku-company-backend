import { Router } from "express";
import type { Request, Response } from "express";
import { CompanyController } from "../controller/companyController.js";
import {body} from "express-validator";
import { profileValidation } from "../middlewares/profileValidation.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = Router();
const companyController = new CompanyController();

const createCompanyValidation = [
  body("company_name").optional().isString().withMessage("Company name must be a string"),
  body("description").notEmpty().isString().withMessage("Description is required"),
  body("industry").notEmpty().isString().withMessage("Industry is required"),
  body("tel").notEmpty().isString().withMessage("Tel is required"),
  body("location").notEmpty().isString().withMessage("Location is required"),
];

const updateCompanyValidation = [
  body("company_name").optional().isString().withMessage("Company name must be a string"),
  body("description").optional().isString().withMessage("Description must be a string"),
  body("industry").optional().isString().withMessage("Industry must be a string"),
  body("tel").optional().isString().withMessage("Tel must be a string"),
  body("location").optional().isString().withMessage("Location must be a string"),
];

router.post("/profile",  createCompanyValidation, profileValidation, async (req: Request, res: Response) => {
    // create company profile
    companyController.create_profile(req, res);
});

router.get("/profile", async (req: Request, res: Response) => {
    companyController.get_profile(req, res);
});

router.patch("/profile",  updateCompanyValidation, profileValidation, async (req: Request, res: Response) => {
    // update company profile
    companyController.update_profile(req, res);
});

router.post("/profile/image",
  upload.single("profile_image"), // frontend should send key "profile_image"
  async (req: Request, res: Response) => {
    companyController.upload_profile_image(req, res);
  }
);

router.get("/profile/image", async (req: Request, res: Response) => {
  companyController.get_profile_image(req, res);
});

//delete profile

router.post("/job-posting", async (req: Request, res: Response) => {
  // create job posting
  companyController.create_job_posting(req, res);
});


// update job posting
router.patch("/job-posting/:id", async (req: Request, res: Response) => {
  companyController.update_job_posting(req, res);
});

// get job posting
// router.get("/job-posting/:id", async (req: Request, res: Response) => {
//   companyController.get_job_posting(req, res);
// });

// get all job postings for a company

// delete job posting



export default router;
