import { Router } from "express"
import { JobPostingPublicController} from "../controller/jobPostingPublicController.js";


const router = Router();
const jobPostingPublicController = new JobPostingPublicController();

// /api/job-postings?keyword=Emily Company&category=Backend_Developer&jobType=PartTime
router.get("/", (req, res) => {
    // return all job postings with optional filters: keyword, category, jobType
    jobPostingPublicController.get_all_job_postings(req, res);
})

// /api/job-postings/category
router.get("/category", (req, res) => {
    // for dropdown
    // return all job categories (Position enum values)
    jobPostingPublicController.get_all_job_categories(req, res);
})

// /api/job-postings/job-type
router.get("/job-type", (req, res) => {
    // for dropdown
    // return all job types (JobType enum values)
    jobPostingPublicController.get_all_job_types(req, res);
})

// /api/job-postings/:id
router.get("/:id", (req, res) => {
    // return job posting by id
    jobPostingPublicController.get_job_posting_by_id(req, res);
})

export default router;