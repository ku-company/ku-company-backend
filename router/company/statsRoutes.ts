import { Router } from "express";
import type { Request, Response } from "express";
import { CompanyController } from "../../controller/companyController.js";

const router = Router();
const companyController = new CompanyController();

router.get("/", async (req: Request, res: Response) => {
    companyController.get_stats(req, res);
});

export default router;