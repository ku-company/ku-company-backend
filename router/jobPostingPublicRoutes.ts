import { Router } from "express"
import { JobPostingPublicController} from "../controller/jobPostingPublicController.js";


const router = Router();
const jobPostingPublicController = new JobPostingPublicController();

// /api/job-postings?keyword=part time&category=Backend_Developer
router.get("/", (req, res) => {
    // return all job postings
    jobPostingPublicController.get_all_job_postings(req, res);
})

// /api/job-postings/:id
router.get("/:id", (req, res) => {
    // return job posting by id
    jobPostingPublicController.get_job_posting_by_id(req, res);
})

export default router;