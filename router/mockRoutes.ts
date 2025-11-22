import { Router } from "express";
import { MockController } from "../controller/mockController.js";
import authorizeRole from "../middlewares/rolebasedMiddleware.js";

const router = Router();
const mockController = new MockController();

/**
 * @swagger
 * tags:
 *   - name: Mock
 *     description: Mock/demo routes used for testing role-based access
 */

/**
 * @swagger
 * /api/mock/findjob:
 *   get:
 *     summary: Return mocked job search data
 *     tags: [Mock]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get("/findjob", (req, res) => {
  mockController.mockdata_findjob(req, res);
});

/**
 * @swagger
 * /api/mock/admin:
 *   get:
 *     summary: Admin-only test endpoint
 *     tags: [Mock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin Route
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/admin", authorizeRole("Admin"), (req, res) => {
  res.status(200).json({
    message: "Admin Route",
  });
});

/**
 * @swagger
 * /api/mock/student:
 *   get:
 *     summary: Student or Company test endpoint
 *     tags: [Mock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student or Company Route
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/student", authorizeRole("Student", "Company"), (req, res) => {
  res.status(200).json({
    message: "Student or Company Route",
  });
});

/**
 * @swagger
 * /api/mock/company:
 *   get:
 *     summary: Company-only test endpoint
 *     tags: [Mock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company Route
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/company", authorizeRole("Company"), (req, res) => {
  res.status(200).json({
    message: "Company Route",
  });
});

/**
 * @swagger
 * /api/mock/professor:
 *   get:
 *     summary: Professor-only test endpoint
 *     tags: [Mock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Professor Route
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/professor", authorizeRole("Professor"), (req, res) => {
  res.status(200).json({
    message: "Professor Route",
  });
});

export default router;
