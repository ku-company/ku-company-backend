import { Router } from "express"
import { JobPostingPublicController} from "../controller/jobPostingPublicController.js";


const router = Router();
const jobPostingPublicController = new JobPostingPublicController();

// /api/job-postings?keyword=Emily Company&category=Backend_Developer&jobType=PartTime
router.get("/", (req, res) => {
    // return all job postings with optional filters: keyword, category, jobType
    jobPostingPublicController.get_all_job_postings(req, res);
})

// /api/job-postings/:id
router.get("/:id", (req, res) => {
    // return job posting by id
    jobPostingPublicController.get_job_posting_by_id(req, res);
})

export default router;