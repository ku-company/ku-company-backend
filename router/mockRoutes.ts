import { Router } from "express"
import { MockController } from "../controller/mockController.js";


const router = Router();
const mockController = new MockController();


router.get("/findjob", (req, res) => {
    mockController.mockdata_findjob(req, res);
})

export default router;