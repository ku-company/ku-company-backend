import { body, query } from "express-validator";
import { Role } from "../utils/enums.js";

// Prisma VerifiedStatus values mirrored for runtime validation
const VerifiedStatuses = ["Pending", "Approved", "Rejected"] as const;

export const addUserValidators = [
  body("email").isEmail().withMessage("Invalid email"),
  body("role").isIn(Object.values(Role)).withMessage("Invalid role"),
  // optional fields commonly provided when admin creates users
  body("stdId").optional({ nullable: true }).isString().trim().isLength({ min: 10, max: 10 }).withMessage("Invalid stdId"),
  body("user_name").optional({ nullable: true }).isString().trim().isLength({ min: 1, max: 30 }).withMessage("Invalid user_name"),
  body("first_name").optional({ nullable: true }).isString().trim().isLength({ min: 1, max: 50 }).withMessage("Invalid first_name"),
  body("last_name").optional({ nullable: true }).isString().trim().isLength({ min: 1, max: 50 }).withMessage("Invalid last_name"),
  body("company_name").optional({ nullable: true }).isString().trim().isLength({ min: 1, max: 255 }).withMessage("Invalid company_name"),
  body("verified").optional({ nullable: true }).isBoolean().withMessage("Invalid verified").toBoolean(),
];

export const editUserStatusValidators = [
  body("status").isIn(VerifiedStatuses as unknown as string[]).withMessage("Invalid status"),
];

export const editUserVerifiedValidators = [
  body("verified").isBoolean().withMessage("Invalid verified").toBoolean(),
];

export const filterUsersValidators = [
  query("status").optional({ nullable: true }).isIn(VerifiedStatuses as unknown as string[]).withMessage("Invalid status"),
];
