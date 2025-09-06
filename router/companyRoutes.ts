import { Router } from "express";
import { CompanyController } from "../controller/companyController.js";

const router = Router();
const companyController = new CompanyController();

router.post("/profile", async (req, res) => {
    // create company profile
    companyController.create_profile(req, res);
});

router.get("/profile", async (req, res) => {
    companyController.get_profile(req, res);
});

export default router;
