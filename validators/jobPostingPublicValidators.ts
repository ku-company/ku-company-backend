import { query } from "express-validator";
import { JobType, Position } from "../utils/enums.js";

export const listPublicJobPostingsValidators = [
  query("keyword").optional({ nullable: true }).isString().trim().isLength({ max: 200 }).withMessage("Invalid keyword"),
  query("category").optional({ nullable: true }).isIn(Object.values(Position)).withMessage("Invalid category"),
  query("jobType").optional({ nullable: true }).isIn(Object.values(JobType)).withMessage("Invalid jobType"),
  query("sortOrder").optional({ nullable: true }).isIn(["asc", "desc"]).withMessage("Invalid sortOrder"),
];
