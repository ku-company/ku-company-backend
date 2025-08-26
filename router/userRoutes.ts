import { Router } from "express"
import { UserController } from "../controller/userController.js";

const router = Router();
const userController = new UserController()

router.post("/sign-up", async (req, res) => {
    userController.sign_up(req, res)
})

export default router