import { Router } from "express";
import type { Request, Response } from "express";
import { CompanyController } from "../../controller/companyController.js";
import { param, body } from "express-validator";
import { validationHandler } from "../../middlewares/validationHandler.js";

const router = Router();
const companyController = new CompanyController();

router.get("/", async (req: Request, res: Response) => {
  // get all job applications for a company
  companyController.get_all_job_applications(req, res);
});

router.get("/:id",
  param("id").isInt().withMessage("Invalid id"),
  validationHandler,
  async (req: Request, res: Response) => {
  // get job application by id
  companyController.get_job_application(req, res);
});

router.patch("/:id/status",
  param("id").isInt().withMessage("Invalid id"),
  body("status").isString().withMessage("Invalid status"),
  validationHandler,
  async (req: Request, res: Response) => {
  // update job application status by id
  companyController.update_job_application_status(req, res);
});

router.post("/:id/confirm",
  param("id").isInt().withMessage("Invalid id"),
  validationHandler,
  async (req: Request, res: Response) => {
  companyController.send_confirmation_to_employee(req,res)
})
export default router;