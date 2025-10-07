import { Router } from "express";
import profileRouter from "./company/profileRoutes.js";
import jobPostingRouter from "./company/jobPostingRoutes.js";
import jobApplicationRouter from "./company/jobApplicationRoutes.js";

const router = Router();

router.use("/profile", profileRouter);       // /api/company/profile
router.use("/job-postings", jobPostingRouter); // /api/company/job-postings
router.use("/job-applications", jobApplicationRouter); // /api/company/job-applications

export default router;
