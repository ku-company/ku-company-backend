import { Router } from "express";
import { EmployeeController } from "../controller/employeeController.js";
import verifiedMiddleware from "../middlewares/verifiedMiddleware.js";
import authorizeRole from "../middlewares/rolebasedMiddleware.js";
import {uploadPdf } from "../middlewares/uploadPdfMiddleware.js";
import { uploadImage } from "../middlewares/uploadImageMiddleware.js";
import type { Request, Response } from "express";
import { UserController } from "../controller/userController.js";
import { param, body } from "express-validator";
import { validationHandler } from "../middlewares/validationHandler.js";

const router = Router();
const employeeController = new EmployeeController();
const userController = new UserController();
/**
 * @swagger
 * tags:
 *   - name: Employee
 *     description: Employee profile, resumes, and applications (requires Student/Alumni/Admin)
 */

router.use(authorizeRole("Student", "Alumni", "Admin"));

router.post("/my-profile/create", async (req , res) =>{
    employeeController.create_profile(req, res)
})

/**
 * @swagger
 * /api/employee/my-profile/create:
 *   post:
 *     summary: Create employee profile
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/my-profile", async (req , res) =>{
    employeeController.get_employee_profile(req, res)
})
/**
 * @swagger
 * /api/employee/my-profile:
 *   get:
 *     summary: Get current employee profile
 *     tags: [Employee]
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

router.get("/profile/image", async (req: Request, res: Response) => {
  userController.get_profile_image(req, res);
});

/**
 * @swagger
 * /api/employee/profile/image:
 *   get:
 *     summary: Get current user's profile image
 *     tags: [Employee]
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

router.use(verifiedMiddleware);


// === Profile Image Routes ===
router.post(
  "/profile/image",
  uploadImage.single("profile_image"),
  async (req: Request, res: Response) => {
    userController.upload_profile_image(req, res);
});

/**
 * @swagger
 * /api/employee/profile/image:
 *   post:
 *     summary: Upload profile image
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profile_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Uploaded
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */


router.patch("/profile/image", uploadImage.single("profile_image"), async (req: Request, res: Response) => {
  //update profile image
  userController.update_profile_image(req, res);
});

/**
 * @swagger
 * /api/employee/profile/image:
 *   patch:
 *     summary: Update profile image
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profile_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

router.delete("/profile/image", async (req: Request, res: Response) => {
  //delete profile image
  userController.delete_profile_image(req, res);
});

/**
 * @swagger
 * /api/employee/profile/image:
 *   delete:
 *     summary: Delete profile image
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

// === Resume Routes ===
router.post("/profile/resumes", uploadPdf.array("resume", 3), async (req, res) => {
    // can upload max 3 resume files
    employeeController.upload_resumes(req, res);
})

/**
 * @swagger
 * /api/employee/profile/resumes:
 *   post:
 *     summary: Upload up to 3 resumes
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resume:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Uploaded
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

router.get("/profile/resumes", (req, res) => {
    // get list of resumes
    employeeController.get_resumes(req, res);
});

/**
 * @swagger
 * /api/employee/profile/resumes:
 *   get:
 *     summary: List uploaded resumes
 *     tags: [Employee]
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

router.get("/profile/resumes/main", (req, res) => {
    // get main resume
    employeeController.get_main_resume(req, res);
});

/**
 * @swagger
 * /api/employee/profile/resumes/main:
 *   get:
 *     summary: Get main resume
 *     tags: [Employee]
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

router.get("/profile/resumes/:id",
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    (req, res) => {
    // get specific resume by id
    employeeController.get_resume(req, res);
});

/**
 * @swagger
 * /api/employee/profile/resumes/{id}:
 *   get:
 *     summary: Get resume by ID
 *     tags: [Employee]
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

router.delete("/profile/resumes/:id",
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    (req, res) => {
    // delete specific resume by id
    employeeController.delete_resume(req, res);
});

/**
 * @swagger
 * /api/employee/profile/resumes/{id}:
 *   delete:
 *     summary: Delete resume by ID
 *     tags: [Employee]
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

router.delete("/profile/resumes", (req, res) => {
    // delete all resumes
    employeeController.delete_all_resumes(req, res);
});

/**
 * @swagger
 * /api/employee/profile/resumes:
 *   delete:
 *     summary: Delete all resumes
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

router.patch("/profile/resumes/:id/set-main",
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    (req, res) => {
    // set specific resume as main
  employeeController.set_main_resume(req, res);
});

/**
 * @swagger
 * /api/employee/profile/resumes/{id}/set-main:
 *   patch:
 *     summary: Set resume as main
 *     tags: [Employee]
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
 *         description: Updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */

// === Employee Profile Routes ===
// Manage employee profile

router.patch(
    "/my-profile/edit",
    body("first_name").optional({ nullable: true }).isString().trim().withMessage("Invalid first_name"),
    body("last_name").optional({ nullable: true }).isString().trim().withMessage("Invalid last_name"),
    body("birthDate").optional({ nullable: true }).isISO8601().withMessage("Invalid birthDate"),
    body("education").optional({ nullable: true }).isString().trim().withMessage("Invalid education"),
    body("summary").optional({ nullable: true }).isString().trim().withMessage("Invalid summary"),
    body("skills").optional({ nullable: true }).isString().trim().withMessage("Invalid skills"),
    body("experience").optional({ nullable: true }).isString().trim().withMessage("Invalid experience"),
    body("contactInfo").optional({ nullable: true }).isString().trim().withMessage("Invalid contactInfo"),
    body("languages").optional({ nullable: true }).isString().trim().withMessage("Invalid languages"),
    validationHandler,
    async (req , res) => {
        employeeController.edit_profile(req, res)
})

/**
 * @swagger
 * /api/employee/my-profile/edit:
 *   patch:
 *     summary: Update employee profile
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

router.delete("/my-profile/delete", async (req , res) => {
    employeeController.delete_profile(req,res)
})

/**
 * @swagger
 * /api/employee/my-profile/delete:
 *   delete:
 *     summary: Delete employee profile
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

//Apply job
router.post(
    "/apply-job/:id",
    param("id").isInt().withMessage("Invalid id"),
    body("resume_id").isInt().withMessage("Invalid resume_id"),
    validationHandler,
    async(req , res) => { employeeController.apply_to_individual_job(req, res) }
)

/**
 * @swagger
 * /api/employee/apply-job/{id}:
 *   post:
 *     summary: Apply to a job posting using a resume
 *     tags: [Employee]
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
 *               resume_id: { type: integer }
 *             required: [resume_id]
 *     responses:
 *       201:
 *         description: Applied
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */

router.get("/my-resumes", async(req , res) => {
    employeeController.get_all_resumes(req, res)
})

/**
 * @swagger
 * /api/employee/my-resumes:
 *   get:
 *     summary: List all resumes (metadata)
 *     tags: [Employee]
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

router.delete("/cancel-application/:id",
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    async(req , res) => { employeeController.cancel_application(req, res) }
)

/**
 * @swagger
 * /api/employee/cancel-application/{id}:
 *   delete:
 *     summary: Cancel a job application by ID
 *     tags: [Employee]
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
 *         description: Canceled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */

router.get("/my-applications", async(req , res) => {
    employeeController.list_all_applications(req,res)
})

/**
 * @swagger
 * /api/employee/my-applications:
 *   get:
 *     summary: List all job applications submitted by current user
 *     tags: [Employee]
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

router.post(
    "/checkout/apply-jobs",
    body("resume_id").isInt().withMessage("Invalid resume_id"),
    body("job_id").isArray({ min: 1 }).withMessage("job_id must be a non-empty array"),
    body("job_id.*").isInt().withMessage("job_id elements must be integers"),
    validationHandler,
    async(req , res) => {
        employeeController.checkout_list_apply_job(req, res)
})

/**
 * @swagger
 * /api/employee/checkout/apply-jobs:
 *   post:
 *     summary: Apply to multiple job postings in a single request
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resume_id: { type: integer }
 *               job_id:
 *                 type: array
 *                 items: { type: integer }
 *             required: [resume_id, job_id]
 *     responses:
 *       201:
 *         description: Applied
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

router.post("/job-applications/:id/confirm",
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    async(req , res) => { employeeController.sent_the_confirmation_to_company(req, res) }
)

/**
 * @swagger
 * /api/employee/job-applications/{id}/confirm:
 *   post:
 *     summary: Send confirmation to company for a job application
 *     tags: [Employee]
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

// comment company profile
// === Employee Comment Routes ===
router.post("/comment/:id",
    param("id").isInt().withMessage("Invalid id"),
    body("comment").isString().trim().notEmpty().withMessage("Comment is required"),
    validationHandler,
    async (req , res) =>{
    // id is company id
    employeeController.add_comment_to_company(req, res)
})

/**
 * @swagger
 * /api/employee/comment/{id}:
 *   post:
 *     summary: Add a comment to a company
 *     tags: [Employee]
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
 *               comment: { type: string }
 *             required: [comment]
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
router.patch("/comment/:id/edit",
    param("id").isInt().withMessage("Invalid id"),
    body("comment").isString().trim().notEmpty().withMessage("Comment is required"),
    validationHandler,
    async (req , res ) => {
    // id is comment id
    employeeController.edit_comment(req, res)
})

/**
 * @swagger
 * /api/employee/comment/{id}/edit:
 *   patch:
 *     summary: Edit a comment
 *     tags: [Employee]
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
 *               comment: { type: string }
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
router.delete("/comment/:id/delete",
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    async (req , res ) =>{
    // id is comment id
    employeeController.delete_comment(req, res)
})

/**
 * @swagger
 * /api/employee/comment/{id}/delete:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Employee]
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
