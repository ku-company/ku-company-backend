import { body, param } from "express-validator";
import { JobType, Position } from "../utils/enums.js";

export const jobPostingIdParam = [
  param("id").isInt({ min: 1 }).withMessage("Invalid job posting ID")
];

export const createJobPostingValidators = [
  body("description").isString().trim().isLength({ min: 1 }).withMessage("Invalid description"),
  body("jobType").isIn(Object.values(JobType)).withMessage("Invalid job type"),
  body("position").isIn(Object.values(Position)).withMessage("Invalid position"),
  body("available_position").isInt({ min: 1, max: 10000 }).withMessage("Invalid available position"),
  body("job_title").optional().isString().trim().isLength({ min: 1, max: 120 }).withMessage("Invalid job title"),
  body("location").optional().isString().trim().isLength({ min: 1, max: 120 }).withMessage("Invalid location"),
  body("work_place").optional().isIn(["Online","OnSite","Hybrid"]).withMessage("Invalid work place"),
  body("minimum_expected_salary").optional().isInt({ min: 0, max: 10000000 }).withMessage("Invalid minimum salary"),
  body("maximum_expected_salary").optional().isInt({ min: 0, max: 10000000 })
    .custom((max,{req}) => req.body.minimum_expected_salary == null || max >= req.body.minimum_expected_salary)
    .withMessage("Max salary must be >= min"),
  body("expired_at").optional({ nullable: true }).isISO8601().toDate().withMessage("Invalid expiration date"),
  body("status").optional().isIn(["Active","Expired","Closed"]).withMessage("Invalid status"),
];

export const updateJobPostingValidators = [
  ...jobPostingIdParam,
  body("description").optional().isString().trim().isLength({ min: 1 }).withMessage("Invalid description"),
  body("jobType").optional().isIn(Object.values(JobType)).withMessage("Invalid job type"),
  body("position").optional().isIn(Object.values(Position)).withMessage("Invalid position"),
  body("available_position").optional().isInt({ min: 1, max: 10000 }).withMessage("Invalid available position"),
  body("job_title").optional().isString().trim().isLength({ min: 1, max: 120 }).withMessage("Invalid job title"),
  body("location").optional().isString().trim().isLength({ min: 1, max: 120 }).withMessage("Invalid location"),
  body("work_place").optional().isIn(["Online","OnSite","Hybrid"]).withMessage("Invalid work place"),
  body("minimum_expected_salary").optional().isInt({ min: 0, max: 10000000 }).withMessage("Invalid minimum salary"),
  body("maximum_expected_salary").optional().isInt({ min: 0, max: 10000000 })
    .custom((max,{req}) => req.body.minimum_expected_salary == null || max >= req.body.minimum_expected_salary)
    .withMessage("Max salary must be >= min"),
  body("expired_at").optional({ nullable: true }).isISO8601().toDate().withMessage("Invalid expiration date"),
  body("status").optional().isIn(["Active","Expired","Closed"]).withMessage("Invalid status"),
];
