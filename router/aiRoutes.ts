import { Router } from "express"
import { AIController } from "../controller/aiController.js";


const router = Router();
const aiController = new AIController();

router.post("/verify-user/:id", async (req , res) => {
    aiController.verify_user(req, res)
})


export default router;