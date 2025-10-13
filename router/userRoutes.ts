import { Router } from "express"
import { UserController } from "../controller/userController.js";
import verifiedMiddleware from "../middlewares/verifiedMiddleware.js";

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
router.get("/logout", async (req, res) => {
    userController.logout(req, res)
})

router.patch("/role", async (req, res) => {
    userController.update_role(req, res)
})

router.get("/profile/:id", verifiedMiddleware ,async(req, res) =>{
    userController.get_profile(req, res)
})

export default router