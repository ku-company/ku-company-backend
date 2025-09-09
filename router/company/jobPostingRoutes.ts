import { Router } from "express";
import type { Request, Response } from "express";
import { CompanyController } from "../../controller/companyController.js";

const router = Router();
const companyController = new CompanyController();

router.post("/", async (req: Request, res: Response) => {
  // create job posting
  companyController.create_job_posting(req, res);
});


router.patch("/:id", async (req: Request, res: Response) => {
  // update job posting
  companyController.update_job_posting(req, res);
});


router.get("/:id", async (req: Request, res: Response) => {
  // get job posting by id
  companyController.get_job_posting(req, res);
});

// get all job postings for a company
// router.get("/job-postings", async (req: Request, res: Response) => {
//   companyController.get_all_job_postings(req, res);
// }

// delete job posting



export default router;
