import { Router } from "express"
import { AIController } from "../controller/aiController.js";
import { param } from "express-validator";
import { validationHandler } from "../middlewares/validationHandler.js";


const router = Router();
const aiController = new AIController();

router.post("/verify-user/:id",
    param("id").isInt().withMessage("Invalid id"),
    validationHandler,
    async (req , res) => {
        aiController.verify_user(req, res)
})


export default router;