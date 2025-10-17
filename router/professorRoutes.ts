import { Router } from "express";
import verifiedMiddleware from "../middlewares/verifiedMiddleware.js";
import authorizeRole from "../middlewares/rolebasedMiddleware.js";
import type { Request, Response } from "express";
import { ProfessorController } from "../controller/professorController.js";

const router = Router();
const professorController = new ProfessorController();
router.use(verifiedMiddleware);
router.use(authorizeRole("Professor", "Admin"));


// === Professor Profile Routes ===
router.get("/my-profile", async (req: Request, res: Response) =>{
    professorController.get_professor_profile(req, res)
})

router.post("/my-profile", async (req , res) =>{
    professorController.create_profile(req, res)
})

router.patch("/my-profile", async (req , res) => {
    professorController.edit_profile(req, res)
})

router.delete("/my-profile", async (req , res) => {
    professorController.delete_profile(req,res)
})

router.post("/comment/:id", async (req , res) =>{
    professorController.add_comment_to_company(req, res)
})
router.patch("/comment/:id/edit", async (req , res ) => {
    professorController.edit_comment(req, res)
})
router.delete("/comment/:id/delete", async (req , res ) =>{
    professorController.delete_comment(req, res)
})


// === Repost Job Posting Routes ===
 router.get("/job-postings/all-reposts", async (req , res) =>{
    // get all repost job posting by professor
    professorController.get_all_repost_job(req, res) // works
})  

 router.post("/job-postings/repost/:id", async (req , res) =>{
    // Repost job posting
    // id is job posting id
    professorController.repost_job(req, res)
}) 


// === Announcement Routes ===
router.post("/announcements", async (req , res) =>{
    professorController.create_announcement(req, res)
}) 

router.get("/announcements/all", async (req , res) =>{
    professorController.get_all_announcement(req, res)
})


// === General Posting Routes === (opinion, announcement, repost)
router.get("/posts/all", async (req , res) =>{
    // get all posts (announcement, opinion, repost)
    professorController.get_all_posts(req, res)
})

router.get("/posts/:id", async (req , res) =>{
    // id is professor's post id
    // get post of all type (repost, announcement, opinion)
    professorController.get_post_by_id(req, res)
}) 

router.patch("/posts/:id", async (req , res) =>{
    // id is professor's post id
    professorController.edit_post(req, res)
}) 

router.delete("/posts/:id", async (req , res) =>{
    // id is professor's post id
    professorController.delete_post(req, res)
})



export default router;
