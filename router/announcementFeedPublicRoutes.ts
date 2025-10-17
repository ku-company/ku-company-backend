import { Router } from "express"
import verifiedMiddleware from "../middlewares/verifiedMiddleware.js";
import { AnnouncementController } from "../controller/announcementFeedPublicController.js";
import authorizeRole from "../middlewares/rolebasedMiddleware.js";

const router = Router();
const announcementController = new AnnouncementController();
router.use(verifiedMiddleware);
router.use(authorizeRole("Student", "Alumni", "Admin", "Professor", "Company"));

// for public access to announcement feed
// /api/announcements
router.get("/", (req, res) => {
    // return all professor's posts.
    announcementController.get_all_posts(req, res);
})


// /api/announcements/:id
router.get("/:id", (req, res) => {
    // return professor's post by id
    announcementController.get_post_by_id(req, res);
})

export default router;