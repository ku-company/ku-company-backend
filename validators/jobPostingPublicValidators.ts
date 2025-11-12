import { query } from "express-validator";
import { JobType } from "../utils/enums.js";

export const listPublicJobPostingsValidators = [
  query("keyword").optional({ nullable: true }).isString().trim().isLength({ max: 200 }).withMessage("Invalid keyword"),
  // category now corresponds to free-text position filtering; validate as a bounded string
  query("category").optional({ nullable: true }).isString().trim().isLength({ min: 1, max: 120 }).withMessage("Invalid category"),
  query("jobType").optional({ nullable: true }).isIn(Object.values(JobType)).withMessage("Invalid jobType"),
  query("sortOrder").optional({ nullable: true }).isIn(["asc", "desc"]).withMessage("Invalid sortOrder"),
];
