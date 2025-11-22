import { Router } from "express"
import type { Request, Response } from "express";
import { JobPostingPublicController} from "../controller/jobPostingPublicController.js";
import { param } from "express-validator";
import { validationHandler } from "../middlewares/validationHandler.js";
import { listPublicJobPostingsValidators } from "../validators/jobPostingPublicValidators.js";


const router = Router();
/**
 * @swagger
 * tags:
 *   - name: JobPostingPublic
 *     description: Public job postings feed and details
 */
const jobPostingPublicController = new JobPostingPublicController();

// /api/job-postings?keyword=Emily Company&category=Backend_Developer&jobType=PartTime
router.get("/", listPublicJobPostingsValidators, validationHandler, (req: Request, res: Response) => {
/**
 * @swagger
 * /api/job-postings:
 *   get:
 *     summary: List public job postings
 *     tags: [JobPostingPublic]
 *     responses:
 *       200:
 *         description: Success
 */
    // return all job postings with optional filters: keyword, category, jobType
    jobPostingPublicController.get_all_job_postings(req, res);
})

/**
 * @swagger
 * /api/job-postings/category:
 *   get:
 *     summary: List job posting categories
 *     tags: [JobPostingPublic]
 *     responses:
 *       200:
 *         description: Success
 */
// /api/job-postings/category
router.get("/category", (req, res) => {
    // for dropdown
    // return all job categories (Position enum values)
    jobPostingPublicController.get_all_job_categories(req, res);
})

/**
 * @swagger
 * /api/job-postings/job-type:
 *   get:
 *     summary: List job posting types
 *     tags: [JobPostingPublic]
 *     responses:
 *       200:
 *         description: Success
 */
// /api/job-postings/job-type
router.get("/job-type", (req, res) => {
    // for dropdown
    // return all job types (JobType enum values)
    jobPostingPublicController.get_all_job_types(req, res);
})

// /api/job-postings/:id
router.get("/:id",
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    (req, res) => {
/**
 * @swagger
 * /api/job-postings/{id}:
 *   get:
 *     summary: Get a public job posting by id
 *     tags: [JobPostingPublic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 */
    // return job posting by id
    jobPostingPublicController.get_job_posting_by_id(req, res);
})

export default router;