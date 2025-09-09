import { Router } from "express";
import profileRouter from "./company/profileRoutes.js";
import jobPostingRouter from "./company/jobPostingRoutes.js";

const router = Router();

router.use("/profile", profileRouter);       // /api/company/profile
router.use("/job-postings", jobPostingRouter); // /api/company/job-postings

export default router;
