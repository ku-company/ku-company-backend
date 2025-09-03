import { Router } from "express"
import { MockController } from "../controller/mockController.js";
import authorizeRole from "../middlewares/rolebasedMiddleware.js";


const router = Router();
const mockController = new MockController();


router.get("/findjob", (req, res) => {
    mockController.mockdata_findjob(req, res);
})

router.get("/admin", authorizeRole("Admin"), (req, res) => {
    res.status(200).json({
        "message": "Admin Route"
    })
})

router.get("/student", authorizeRole("Student", "Company"), (req, res) => {
    res.status(200).json({
        "message": "Student or Company Route"
    })
})

router.get("/company", authorizeRole("Company"), (req, res) => {
    res.status(200).json({
        "message": "Company Route"
    })
})

router.get("/professor", authorizeRole("Professor"), (req, res) => {
    res.status(200).json({
        "message": "Professor Route"
    })
})


export default router;