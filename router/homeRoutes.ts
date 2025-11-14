import { Router } from "express"
import { JobPostingPublicController} from "../controller/jobPostingPublicController.js";
import { HomePublicController } from "../controller/homePublicController.js";


const router = Router();
const homePublicController = new HomePublicController();

// api/home/top-companies
router.get("/top-companies", (req, res) => {
    // return top 10 companies with most job postings
    homePublicController.get_top_companies(req, res);
})

export default router;