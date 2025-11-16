import { Router } from "express";
import verifiedMiddleware from "../middlewares/verifiedMiddleware.js";
import authorizeRole from "../middlewares/rolebasedMiddleware.js";
import type { Request, Response } from "express";
import { ProfessorController } from "../controller/professorController.js";
import { param, body } from "express-validator";
import { validationHandler } from "../middlewares/validationHandler.js";

const router = Router();
/**
 * @swagger
 * tags:
 *   - name: Professor
 *     description: Professor profile, posts, and comments (requires Professor/Admin)
 */
const professorController = new ProfessorController();
router.use(authorizeRole("Professor", "Admin"));


// === Professor Profile Routes ===
router.get("/my-profile", async (req: Request, res: Response) =>{
    // does not require verified middleware
    professorController.get_professor_profile(req, res)
})

/**
 * @swagger
 * /api/professor/my-profile:
 *   get:
 *     summary: Get current professor profile
 *     tags: [Professor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile returned
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

router.post(
    "/my-profile",
    // does not require verified middleware
    body("department").isString().trim().notEmpty().withMessage("Department is required"),
    body("faculty").isString().trim().notEmpty().withMessage("Faculty is required"),
    body("position").optional({ nullable: true }).isString().trim().withMessage("Invalid position"),
    body("contactInfo").optional({ nullable: true }).isString().trim().withMessage("Invalid contactInfo"),
    body("summary").optional({ nullable: true }).isString().trim().withMessage("Invalid summary"),
    body("lab").optional({ nullable: true }).isString().trim().withMessage("Invalid lab"),
    validationHandler,
    async (req , res) =>{
        professorController.create_profile(req, res)
    }
)

/**
 * @swagger
 * /api/professor/my-profile:
 *   post:
 *     summary: Create professor profile
 *     tags: [Professor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               department:
 *                 type: string
 *               faculty:
 *                 type: string
 *               position:
 *                 type: string
 *               contactInfo:
 *                 type: string
 *               summary:
 *                 type: string
 *               lab:
 *                 type: string
 *             required: [department, faculty]
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

router.use(verifiedMiddleware);

router.patch(
    "/my-profile",
    body("first_name").optional({ nullable: true }).isString().trim().withMessage("Invalid first_name"),
    body("last_name").optional({ nullable: true }).isString().trim().withMessage("Invalid last_name"),
    body("department").optional({ nullable: true }).isString().trim().withMessage("Invalid department"),
    body("faculty").optional({ nullable: true }).isString().trim().withMessage("Invalid faculty"),
    body("position").optional({ nullable: true }).isString().trim().withMessage("Invalid position"),
    body("contactInfo").optional({ nullable: true }).isString().trim().withMessage("Invalid contactInfo"),
    body("summary").optional({ nullable: true }).isString().trim().withMessage("Invalid summary"),
    body("lab").optional({ nullable: true }).isString().trim().withMessage("Invalid lab"),
    validationHandler,
    async (req , res) => {
        professorController.edit_profile(req, res)
    }
)

/**
 * @swagger
 * /api/professor/my-profile:
 *   patch:
 *     summary: Update current professor profile
 *     tags: [Professor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
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

router.delete("/my-profile", async (req , res) => {
    professorController.delete_profile(req,res)
})

/**
 * @swagger
 * /api/professor/my-profile:
 *   delete:
 *     summary: Delete current professor profile
 *     tags: [Professor]
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

// === Degree Routes ===
router.post(
    "/degrees",
    body("title").isString().trim().notEmpty().withMessage("Degree title is required"),
    body("institution").optional({ nullable: true }).isString().trim().withMessage("Invalid institution"),
    body("graduation_date").optional({ nullable: true }).isISO8601().withMessage("Invalid graduation_date"),
    body("description").optional({ nullable: true }).isString().trim().withMessage("Invalid description"),
    validationHandler,
    async (req , res) =>{
        professorController.add_degree(req, res)
    }
)

/**
 * @swagger
 * /api/professor/degrees:
 *   post:
 *     summary: Add a degree
 *     tags: [Professor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               institution: { type: string }
 *               graduation_date: { type: string, format: date }
 *               description: { type: string }
 *             required: [title]
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

router.get("/degrees", async (req , res) =>{
    // get all degrees of professor
    professorController.get_all_degrees(req, res)
})

/**
 * @swagger
 * /api/professor/degrees:
 *   get:
 *     summary: List all degrees
 *     tags: [Professor]
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

router.patch(
    "/degrees/:id",
    param("id").isInt().withMessage("Invalid id"),
    body("title").optional({ nullable: true }).isString().trim().withMessage("Invalid title"),
    body("institution").optional({ nullable: true }).isString().trim().withMessage("Invalid institution"),
    body("graduation_date").optional({ nullable: true }).isISO8601().withMessage("Invalid graduation_date"),
    body("description").optional({ nullable: true }).isString().trim().withMessage("Invalid description"),
    validationHandler,
    async (req , res ) => { professorController.edit_degree(req, res) }
)

/**
 * @swagger
 * /api/professor/degrees/{id}:
 *   patch:
 *     summary: Update a degree
 *     tags: [Professor]
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

router.delete("/degrees/:id",
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    async (req , res ) => { professorController.delete_degree(req, res) }
)

/**
 * @swagger
 * /api/professor/degrees/{id}:
 *   delete:
 *     summary: Delete a degree
 *     tags: [Professor]
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


// === Professor Comment Routes ===
router.post(
    "/comment/:id",
    param("id").isInt().withMessage("Invalid id"),
    body("comment").isString().trim().notEmpty().withMessage("Comment is required"),
    validationHandler,
    async (req , res) => { professorController.add_comment_to_company(req, res) }
)

/**
 * @swagger
 * /api/professor/comment/{id}:
 *   post:
 *     summary: Add a comment to a company
 *     tags: [Professor]
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
 *               comment:
 *                 type: string
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
router.patch(
    "/comment/:id/edit",
    param("id").isInt().withMessage("Invalid id"),
    body("comment").isString().trim().notEmpty().withMessage("Comment is required"),
    validationHandler,
    async (req , res ) => { professorController.edit_comment(req, res) }
)

/**
 * @swagger
 * /api/professor/comment/{id}/edit:
 *   patch:
 *     summary: Edit a comment
 *     tags: [Professor]
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
    async (req , res ) => { professorController.delete_comment(req, res) }
)

/**
 * @swagger
 * /api/professor/comment/{id}/delete:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Professor]
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


// === Repost Job Posting Routes ===
 router.get("/job-postings/all-reposts", async (req , res) =>{
    // get all repost job posting by professor
    professorController.get_all_repost_job(req, res) 
})  

/**
 * @swagger
 * /api/professor/job-postings/all-reposts:
 *   get:
 *     summary: List all reposted job postings by the professor
 *     tags: [Professor]
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
    "/job-postings/repost/:id",
    param("id").isInt().withMessage("Invalid id"),
    body("content").optional({ nullable: true }).isString().trim().withMessage("Invalid content"),
    body("is_connection").optional({ nullable: true }).isBoolean().withMessage("Invalid is_connection").toBoolean(),
    validationHandler,
    async (req , res) => {
        professorController.repost_job(req, res)
}) 

/**
 * @swagger
 * /api/professor/job-postings/repost/{id}:
 *   post:
 *     summary: Repost a job posting
 *     tags: [Professor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content: { type: string }
 *               is_connection: { type: boolean }
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */


// === Announcement Routes ===
router.post(
    "/announcements",
    body("content").isString().trim().notEmpty().withMessage("Content is required"),
    body("is_connection").optional({ nullable: true }).isBoolean().withMessage("Invalid is_connection").toBoolean(),
    validationHandler,
    async (req , res) =>{
        professorController.create_announcement(req, res)
    }
) 

/**
 * @swagger
 * /api/professor/announcements:
 *   post:
 *     summary: Create an announcement
 *     tags: [Professor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content: { type: string }
 *               is_connection: { type: boolean }
 *             required: [content]
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

router.get("/announcements/all", async (req , res) =>{
    professorController.get_all_announcement(req, res)
})

/**
 * @swagger
 * /api/professor/announcements/all:
 *   get:
 *     summary: List all announcements by the professor
 *     tags: [Professor]
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

// === Opinion Routes ===
router.post(
    "/opinions",
    body("content").isString().trim().notEmpty().withMessage("Content is required"),
    body("is_connection").optional({ nullable: true }).isBoolean().withMessage("Invalid is_connection").toBoolean(),
    validationHandler,
    async (req, res) => {
        professorController.create_opinion(req, res)
    }
)

/**
 * @swagger
 * /api/professor/opinions:
 *   post:
 *     summary: Create an opinion post
 *     tags: [Professor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content: { type: string }
 *               is_connection: { type: boolean }
 *             required: [content]
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

router.get("/opinions/all", async (req, res) => {
    professorController.get_all_opinions(req, res)
})

/**
 * @swagger
 * /api/professor/opinions/all:
 *   get:
 *     summary: List all opinions by the professor
 *     tags: [Professor]
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


// === General Posting Routes === (opinion, announcement, repost)
router.get("/posts/all", async (req , res) =>{
    // get all posts (announcement, opinion, repost)
    professorController.get_all_posts(req, res)
})

/**
 * @swagger
 * /api/professor/posts/all:
 *   get:
 *     summary: List all posts (announcements, opinions, reposts)
 *     tags: [Professor]
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

router.get("/posts/:id",
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    async (req , res) => {
        professorController.get_post_by_id(req, res)
}) 

/**
 * @swagger
 * /api/professor/posts/{id}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Professor]
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

router.patch(
    "/posts/:id",
    param("id").isInt().withMessage("Invalid id"),
    body("content").optional({ nullable: true }).isString().trim().withMessage("Invalid content"),
    body("is_connection").optional({ nullable: true }).isBoolean().withMessage("Invalid is_connection").toBoolean(),
    validationHandler,
    async (req , res) => {
        professorController.edit_post(req, res)
}) 

/**
 * @swagger
 * /api/professor/posts/{id}:
 *   patch:
 *     summary: Update a post
 *     tags: [Professor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content: { type: string }
 *               is_connection: { type: boolean }
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

router.delete("/posts/:id",
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    async (req , res) => {
        professorController.delete_post(req, res)
})

/**
 * @swagger
 * /api/professor/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Professor]
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
