import { Router } from "express";
import type { Request, Response } from "express";
import { CompanyController } from "../../controller/companyController.js";
import { validationHandler } from "../../middlewares/validationHandler.js";
import { createJobPostingValidators, updateJobPostingValidators, jobPostingIdParam } from "../../validators/companyValidators.js";

const router = Router();
const companyController = new CompanyController();

router.post("/", createJobPostingValidators, validationHandler, async (req: Request, res: Response) => {
  // create job posting
  companyController.create_job_posting(req, res);
});

/**
 * @swagger
 * /api/company/job-postings:
 *   post:
 *     summary: Create a job posting
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description: { type: string }
 *               jobType: { type: string }
 *               position: { type: string }
 *               available_position: { type: integer }
 *               job_title: { type: string }
 *               location: { type: string }
 *               work_place: { type: string, enum: [Online, OnSite, Hybrid] }
 *               minimum_expected_salary: { type: integer }
 *               maximum_expected_salary: { type: integer }
 *               expired_at: { type: string, format: date-time }
 *               status: { type: string, enum: [Active, Expired, Closed] }
 *             required: [description, jobType, position, available_position]
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

router.get("/all", async (req: Request, res: Response) => {
    // get all job postings for a company
  companyController.get_all_job_postings(req, res);
});

/**
 * @swagger
 * /api/company/job-postings/all:
 *   get:
 *     summary: List all job postings for current company
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

router.patch("/:id", updateJobPostingValidators, validationHandler, async (req: Request, res: Response) => {
  // update job posting
  companyController.update_job_posting(req, res);
});

/**
 * @swagger
 * /api/company/job-postings/{id}:
 *   patch:
 *     summary: Update a job posting
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description: { type: string }
 *               jobType: { type: string }
 *               position: { type: string }
 *               available_position: { type: integer }
 *               job_title: { type: string }
 *               location: { type: string }
 *               work_place: { type: string, enum: [Online, OnSite, Hybrid] }
 *               minimum_expected_salary: { type: integer }
 *               maximum_expected_salary: { type: integer }
 *               expired_at: { type: string, format: date-time }
 *               status: { type: string, enum: [Active, Expired, Closed] }
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */


router.get("/:id", jobPostingIdParam, validationHandler, async (req: Request, res: Response) => {
  // get job posting by id
  companyController.get_job_posting(req, res);
});

/**
 * @swagger
 * /api/company/job-postings/{id}:
 *   get:
 *     summary: Get a job posting by ID
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */


// delete job posting
router.delete("/:id", jobPostingIdParam, validationHandler, async (req: Request, res: Response) => {
  companyController.delete_job_posting(req, res);
});

/**
 * @swagger
 * /api/company/job-postings/{id}:
 *   delete:
 *     summary: Delete a job posting
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */



export default router;
