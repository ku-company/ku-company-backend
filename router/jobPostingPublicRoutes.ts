import { Router } from "express"
import { JobPostingPublicController} from "../controller/jobPostingPublicController.js";


const router = Router();
const jobPostingPublicController = new JobPostingPublicController();

// /api/job-postings?keyword=part time&category=Backend_Developer
router.get("/", (req, res) => {
    // return all job postings
    jobPostingPublicController.get_all_job_postings(req, res);
})

export default router;