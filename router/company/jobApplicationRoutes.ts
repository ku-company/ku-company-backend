import { Router } from "express";
import type { Request, Response } from "express";
import { CompanyController } from "../../controller/companyController.js";
import { param, body, query } from "express-validator";
import { validationHandler } from "../../middlewares/validationHandler.js";
import { CompanyJobApplicationStatus } from "../../utils/enums.js";

const router = Router();
const companyController = new CompanyController();

router.get("/",
  // Optional filters and sorting
  query("status").optional({ nullable: true }).isIn(Object.values(CompanyJobApplicationStatus)).withMessage("Invalid status"),
  query("sortField").optional({ nullable: true }).isIn(["position", "applied_at", "status"]).withMessage("Invalid sortField"),
  query("sortOrder").optional({ nullable: true }).isIn(["asc", "desc"]).withMessage("Invalid sortOrder"),
  validationHandler,
  async (req: Request, res: Response) => {
  // get all job applications for a company
  companyController.get_all_job_applications(req, res);
});

/**
 * @swagger
 * /api/company/job-applications:
 *   get:
 *     summary: List job applications for current company
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortField
 *         required: false
 *         schema:
 *           type: string
 *           enum: [position, applied_at, status]
 *       - in: query
 *         name: sortOrder
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

router.get("/:id",
  param("id").isInt().withMessage("Invalid id"),
  validationHandler,
  async (req: Request, res: Response) => {
  // get job application by id
  companyController.get_job_application(req, res);
});

/**
 * @swagger
 * /api/company/job-applications/{id}:
 *   get:
 *     summary: Get job application by ID
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

router.patch("/:id/status",
  param("id").isInt().withMessage("Invalid id"),
  body("status").isIn(Object.values(CompanyJobApplicationStatus)).withMessage("Invalid status"),
  validationHandler,
  async (req: Request, res: Response) => {
  // update job application status by id
  companyController.update_job_application_status(req, res);
});

/**
 * @swagger
 * /api/company/job-applications/{id}/status:
 *   patch:
 *     summary: Update job application status
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
 *               status:
 *                 type: string
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

router.post("/:id/confirm",
  param("id").isInt().withMessage("Invalid id"),
  validationHandler,
  async (req: Request, res: Response) => {
  companyController.send_confirmation_to_employee(req,res)
})

/**
 * @swagger
 * /api/company/job-applications/{id}/confirm:
 *   post:
 *     summary: Send confirmation to employee for an application
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
 *         description: Confirmation sent
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
export default router;