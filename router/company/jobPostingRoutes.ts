import { Router } from "express";
import type { Request, Response } from "express";
import { CompanyController } from "../../controller/companyController.js";
import { validationHandler } from "../../middlewares/validationHandler.js";
import { createJobPostingValidators, updateJobPostingValidators, jobPostingIdParam } from "../../validators/companyValidators.js";

const router = Router();
const companyController = new CompanyController();

router.post("/", createJobPostingValidators, validationHandler, async (req: Request, res: Response) => {
  // create job posting
  companyController.create_job_posting(req, res);
});

router.get("/all", async (req: Request, res: Response) => {
    // get all job postings for a company
  companyController.get_all_job_postings(req, res);
});

router.patch("/:id", updateJobPostingValidators, validationHandler, async (req: Request, res: Response) => {
  // update job posting
  companyController.update_job_posting(req, res);
});


router.get("/:id", jobPostingIdParam, validationHandler, async (req: Request, res: Response) => {
  // get job posting by id
  companyController.get_job_posting(req, res);
});


// delete job posting
router.delete("/:id", jobPostingIdParam, validationHandler, async (req: Request, res: Response) => {
  companyController.delete_job_posting(req, res);
});



export default router;
