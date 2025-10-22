import { Router } from "express";
import type { Request, Response } from "express";
import { CompanyController } from "../../controller/companyController.js";

const router = Router();
const companyController = new CompanyController();

router.post("/", async (req: Request, res: Response) => {
  // create job posting
  companyController.create_job_posting(req, res);
});

router.get("/all", async (req: Request, res: Response) => {
    // get all job postings for a company
  companyController.get_all_job_postings(req, res);
});

router.patch("/:id", async (req: Request, res: Response) => {
  // update job posting
  companyController.update_job_posting(req, res);
});


router.get("/:id", async (req: Request, res: Response) => {
  // get job posting by id
  companyController.get_job_posting(req, res);
});


// delete job posting
router.delete("/:id", async (req: Request, res: Response) => {
  companyController.delete_job_posting(req, res);
});



export default router;
