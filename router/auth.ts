import { Router } from "express";
import {AuthController} from "../controller/authController.js";

const router = Router();
const authController = new AuthController();

router.get("/google", authController.googleLogin);
router.get("/google/callback", authController.googleCallback);
router.get("/failure", authController.authFailure);

export default router;

