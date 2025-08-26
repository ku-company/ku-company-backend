// import { Router } from "express";
// import type { Express , Request, Response }  from "express";
// import passport from "passport";

// const router = Router();

// // Google OAuth login
// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["email", "profile"] })
// );

// // Google OAuth callback
// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     successRedirect: "/protected",
//     failureRedirect: "/auth/failure",
//   })
// );

// // Authentication failure route
// router.get("/failure", (req: Request, res: Response) => {
//   res.send("Authentication failed");
// });

// export default router;

import { Router } from "express";
import {AuthController} from "../controller/authController.js";

const router = Router();
const authController = new AuthController();

// Routes just call controller methods
router.get("/google", authController.googleLogin);
router.get("/google/callback", authController.googleCallback);
router.get("/failure", authController.authFailure);

export default router;

