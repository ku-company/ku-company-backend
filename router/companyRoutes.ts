import { Router } from "express";
import profileRouter from "./company/profileRoutes.js";
import jobPostingRouter from "./company/jobPostingRoutes.js";
import jobApplicationRouter from "./company/jobApplicationRoutes.js";
import dashboardRouter from "./company/dashboardRoutes.js";

const router = Router();
/**
 * @swagger
 * tags:
 *   - name: Company
 *     description: Company profile, job postings, dashboard, and applications (requires Company/Admin)
 */

router.use("/profile", profileRouter);       // /api/company/profile
router.use("/job-postings", jobPostingRouter); // /api/company/job-postings
router.use("/dashboard", dashboardRouter); // /api/company/dashboard
router.use("/job-applications", jobApplicationRouter); // /api/company/job-applications

export default router;
