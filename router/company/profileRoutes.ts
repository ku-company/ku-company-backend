import { Router } from "express";
import type { Request, Response } from "express";
import { CompanyController } from "../../controller/companyController.js";
import { UserController } from "../../controller/userController.js";
import {body} from "express-validator";
import { profileValidation } from "../../middlewares/profileValidation.js";
import { uploadImage } from "../../middlewares/uploadImageMiddleware.js";

const router = Router();
const companyController = new CompanyController();
const userController = new UserController();

router.post("/",async (req: Request, res: Response) => {
    // create company profile
    companyController.create_profile(req, res);
});

router.get("/", async (req: Request, res: Response) => {
    companyController.get_profile(req, res);
});

router.patch("/", async (req: Request, res: Response) => {
    // update company profile
    companyController.update_profile(req, res);
});

router.post(
  "/image",
  uploadImage.single("profile_image"),
  async (req: Request, res: Response) => {
    userController.upload_profile_image(req, res);
});

router.get("/image", async (req: Request, res: Response) => {
  userController.get_profile_image(req, res);
});

router.patch("/image", uploadImage.single("profile_image"), async (req: Request, res: Response) => {
  //update profile image
  userController.update_profile_image(req, res);
});

router.delete("/image", async (req: Request, res: Response) => {
  //delete profile image
  userController.delete_profile_image(req, res);
});


export default router;