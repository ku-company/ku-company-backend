import { Router } from "express";
import verifiedMiddleware from "../middlewares/verifiedMiddleware.js";
import authorizeRole from "../middlewares/rolebasedMiddleware.js";
import type { Request, Response } from "express";
import { ProfessorController } from "../controller/professorController.js";
import { param, body } from "express-validator";
import { validationHandler } from "../middlewares/validationHandler.js";

const router = Router();
const professorController = new ProfessorController();
router.use(authorizeRole("Professor", "Admin"));


// === Professor Profile Routes ===
router.get("/my-profile", async (req: Request, res: Response) =>{
    // does not require verified middleware
    professorController.get_professor_profile(req, res)
})

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

router.delete("/my-profile", async (req , res) => {
    professorController.delete_profile(req,res)
})

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

router.get("/degrees", async (req , res) =>{
    // get all degrees of professor
    professorController.get_all_degrees(req, res)
})

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

router.delete("/degrees/:id",
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    async (req , res ) => { professorController.delete_degree(req, res) }
)


// === Professor Comment Routes ===
router.post(
    "/comment/:id",
    param("id").isInt().withMessage("Invalid id"),
    body("comment").isString().trim().notEmpty().withMessage("Comment is required"),
    validationHandler,
    async (req , res) => { professorController.add_comment_to_company(req, res) }
)
router.patch(
    "/comment/:id/edit",
    param("id").isInt().withMessage("Invalid id"),
    body("comment").isString().trim().notEmpty().withMessage("Comment is required"),
    validationHandler,
    async (req , res ) => { professorController.edit_comment(req, res) }
)
router.delete("/comment/:id/delete",
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    async (req , res ) => { professorController.delete_comment(req, res) }
)


// === Repost Job Posting Routes ===
 router.get("/job-postings/all-reposts", async (req , res) =>{
    // get all repost job posting by professor
    professorController.get_all_repost_job(req, res) 
})  

 router.post(
    "/job-postings/repost/:id",
    param("id").isInt().withMessage("Invalid id"),
    body("content").optional({ nullable: true }).isString().trim().withMessage("Invalid content"),
    body("is_connection").optional({ nullable: true }).isBoolean().withMessage("Invalid is_connection").toBoolean(),
    validationHandler,
    async (req , res) => {
        professorController.repost_job(req, res)
}) 


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

router.get("/announcements/all", async (req , res) =>{
    professorController.get_all_announcement(req, res)
})

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

router.get("/opinions/all", async (req, res) => {
    professorController.get_all_opinions(req, res)
})


// === General Posting Routes === (opinion, announcement, repost)
router.get("/posts/all", async (req , res) =>{
    // get all posts (announcement, opinion, repost)
    professorController.get_all_posts(req, res)
})

router.get("/posts/:id",
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    async (req , res) => {
        professorController.get_post_by_id(req, res)
}) 

router.patch(
    "/posts/:id",
    param("id").isInt().withMessage("Invalid id"),
    body("content").optional({ nullable: true }).isString().trim().withMessage("Invalid content"),
    body("is_connection").optional({ nullable: true }).isBoolean().withMessage("Invalid is_connection").toBoolean(),
    validationHandler,
    async (req , res) => {
        professorController.edit_post(req, res)
}) 

router.delete("/posts/:id",
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    async (req , res) => {
        professorController.delete_post(req, res)
})



export default router;
