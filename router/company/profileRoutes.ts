import { Router } from "express";
import type { Request, Response } from "express";
import { CompanyController } from "../../controller/companyController.js";
import { UserController } from "../../controller/userController.js";
import { body } from "express-validator";
import { profileValidation } from "../../middlewares/profileValidation.js";
import { uploadImage } from "../../middlewares/uploadImageMiddleware.js";

const router = Router();
const companyController = new CompanyController();
const userController = new UserController();

router.post(
  "/",
  body("company_name").optional({ nullable: true }).isString().trim().withMessage("Invalid company_name"),
  body("description").optional({ nullable: true }).isString().trim().withMessage("Invalid description"),
  body("industry").optional({ nullable: true }).isString().trim().withMessage("Invalid industry"),
  body("tel").optional({ nullable: true }).isString().trim().withMessage("Invalid tel"),
  body("location").optional({ nullable: true }).isString().trim().withMessage("Invalid location"),
  body("country").optional({ nullable: true }).isString().trim().withMessage("Invalid country"),
  async (req: Request, res: Response) => {
    // create company profile
    companyController.create_profile(req, res);
});

/**
 * @swagger
 * /api/company/profile:
 *   post:
 *     summary: Create or complete company profile
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_name: { type: string }
 *               description: { type: string }
 *               industry: { type: string }
 *               tel: { type: string }
 *               location: { type: string }
 *               country: { type: string }
 *     responses:
 *       201:
 *         description: Created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

router.get("/", async (req: Request, res: Response) => {
    companyController.get_profile(req, res);
});

/**
 * @swagger
 * /api/company/profile:
 *   get:
 *     summary: Get current company profile
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

router.patch(
  "/",
  body("company_name").optional({ nullable: true }).isString().trim().withMessage("Invalid company_name"),
  body("description").optional({ nullable: true }).isString().trim().withMessage("Invalid description"),
  body("industry").optional({ nullable: true }).isString().trim().withMessage("Invalid industry"),
  body("tel").optional({ nullable: true }).isString().trim().withMessage("Invalid tel"),
  body("location").optional({ nullable: true }).isString().trim().withMessage("Invalid location"),
  body("country").optional({ nullable: true }).isString().trim().withMessage("Invalid country"),
  async (req: Request, res: Response) => {
    // update company profile
    companyController.update_profile(req, res);
});

/**
 * @swagger
 * /api/company/profile:
 *   patch:
 *     summary: Update company profile
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

router.post(
  "/image",
  uploadImage.single("profile_image"),
  async (req: Request, res: Response) => {
    userController.upload_profile_image(req, res);
});

/**
 * @swagger
 * /api/company/profile/image:
 *   post:
 *     summary: Upload company profile image
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profile_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Uploaded
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

router.get("/image", async (req: Request, res: Response) => {
  userController.get_profile_image(req, res);
});

/**
 * @swagger
 * /api/company/profile/image:
 *   get:
 *     summary: Get company profile image metadata or stream
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

router.patch("/image", uploadImage.single("profile_image"), async (req: Request, res: Response) => {
  //update profile image
  userController.update_profile_image(req, res);
});

/**
 * @swagger
 * /api/company/profile/image:
 *   patch:
 *     summary: Update company profile image
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profile_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

router.delete("/image", async (req: Request, res: Response) => {
  //delete profile image
  userController.delete_profile_image(req, res);
});

/**
 * @swagger
 * /api/company/profile/image:
 *   delete:
 *     summary: Delete company profile image
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */


export default router;