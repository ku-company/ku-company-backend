import { Router } from "express";
import type { Request, Response } from "express";
import { CompanyController } from "../controller/companyController.js";
import { body, validationResult } from "express-validator";

const router = Router();
const companyController = new CompanyController();

router.post("/profile",  [
    body("company_name").notEmpty().withMessage("Company name is required"),
    body("description").optional().isString(),
    body("industry").optional().isString(),
  ], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // create company profile
    companyController.create_profile(req, res);
});

router.get("/profile", async (req: Request, res: Response) => {
    companyController.get_profile(req, res);
});

router.put("/profile", async (req: Request, res: Response) => {
    // update company profile
    companyController.update_profile(req, res);
});

export default router;
