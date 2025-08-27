import { Router } from "express"
import { UserController } from "../controller/userController.js";

const router = Router();
const userController = new UserController()

router.post("/refresh-token", async (req, res) => {
    userController.refresh_token(req, res)
})
router.post("/sign-up", async (req, res) => {
    userController.sign_up(req, res)
}),
router.post("/login", async (req,res) => {
    userController.login(req,res)
})

export default router