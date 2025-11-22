import { Router } from "express";
import type { Request, Response } from "express";
import { CompanyController } from "../../controller/companyController.js";

const router = Router();
const companyController = new CompanyController();

router.get("/overall", async (req: Request, res: Response) => {
    companyController.get_stats(req, res);
});

/**
 * @swagger
 * /api/company/dashboard/overall:
 *   get:
 *     summary: Get overall company dashboard stats
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

router.get("/active-postings", async (req: Request, res: Response) => {
    companyController.get_active_job_postings(req, res);
});

/**
 * @swagger
 * /api/company/dashboard/active-postings:
 *   get:
 *     summary: Get active job postings summary
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

export default router;