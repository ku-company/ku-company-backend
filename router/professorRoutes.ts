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


export default router;
