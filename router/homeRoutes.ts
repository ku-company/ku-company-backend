import { Router } from "express"
import { HomePublicController } from "../controller/homePublicController.js";


const router = Router();
const homePublicController = new HomePublicController();

// api/home/top-companies
router.get("/top-companies", (req, res) => {
    // return top 10 companies with most job postings
    homePublicController.get_top_companies(req, res);
})


router.get("/top-job-postings", (req, res) => {
    // return top 3 most recent job postings
    homePublicController.get_top_job_postings(req, res);
})

export default router;