import { Router } from "express";
import type { Request, Response } from "express";
import { CompanyController } from "../../controller/companyController.js";
import {body} from "express-validator";
import { profileValidation } from "../../middlewares/profileValidation.js";
import { upload } from "../../middlewares/uploadMiddleware.js";

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

router.post("/",  createCompanyValidation, profileValidation, async (req: Request, res: Response) => {
    // create company profile
    companyController.create_profile(req, res);
});

router.get("/", async (req: Request, res: Response) => {
    companyController.get_profile(req, res);
});

router.patch("/",  updateCompanyValidation, profileValidation, async (req: Request, res: Response) => {
    // update company profile
    companyController.update_profile(req, res);
});

router.post("/image",
  upload.single("profile_image"), // frontend should send key "profile_image"
  async (req: Request, res: Response) => {
    companyController.upload_profile_image(req, res);
  }
);

router.get("/image", async (req: Request, res: Response) => {
  companyController.get_profile_image(req, res);
});

//delete profile


export default router;