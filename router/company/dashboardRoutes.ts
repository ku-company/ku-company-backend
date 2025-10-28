import { Router } from "express";
import type { Request, Response } from "express";
import { CompanyController } from "../../controller/companyController.js";

const router = Router();
const companyController = new CompanyController();

router.get("/overall", async (req: Request, res: Response) => {
    companyController.get_stats(req, res);
});

router.get("/active-postings", async (req: Request, res: Response) => {
    companyController.get_active_job_postings(req, res);
});

export default router;