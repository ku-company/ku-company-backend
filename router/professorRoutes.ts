import { Router } from "express";
import verifiedMiddleware from "../middlewares/verifiedMiddleware.js";
import authorizeRole from "../middlewares/rolebasedMiddleware.js";
import type { Request, Response } from "express";
import { ProfessorController } from "../controller/professsorController.js";

const router = Router();
const professorController = new ProfessorController();
router.use(verifiedMiddleware);
router.use(authorizeRole("Professor", "Admin"));


// === Professor Profile Routes ===
// Manage professor profile
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
    professorController.get_all_repost_job(req, res)
})  

router.get("/job-postings/repost/:id", async (req , res) =>{
    // id is announcement(repost) id
    professorController.get_repost_by_id(req, res)
})

// Repost job posting
 router.post("/job-postings/repost/:id", async (req , res) =>{
    // id is job posting id
    professorController.repost_job(req, res)
})  

router.patch("/job-postings/repost/:id", async (req , res) =>{
    // id is announcement(repost) id
    professorController.edit_repost(req, res)
})

router.delete("/job-postings/repost/:id", async (req , res) =>{
    // id is announcement(repost) id
    professorController.delete_repost(req,res)   
})

// Professor Announcement Routes
router.post("/announcement", async (req , res) =>{
    professorController.create_announcement(req, res)
})

// router.get("/announcement/all", async (req , res) =>{
//     professorController.get_all_announcement(req, res)
// })

// router.get("/announcement/:id", async (req , res) =>{
//     professorController.get_announcement_by_id(req, res)
// })

// router.patch("/announcement/:id", async (req , res) =>{
//     professorController.edit_announcement(req, res)
// })

// router.delete("/announcement/:id", async (req , res) =>{
//     professorController.delete_announcement(req, res)
// })

export default router;
