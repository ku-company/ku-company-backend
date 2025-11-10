import { body } from "express-validator";
import { Role } from "../utils/enums.js";

// Relaxed to match existing controller tests and service contracts
export const signUpValidators = [
  body("email").isString().isEmail().withMessage("Invalid email"),
  body("password").isString().withMessage("Password is required"),
  body("password").isString().isLength({ min: 8, max: 15 }).withMessage("Password must be 8-15 characters long"),
  body("confirm_password").isString().withMessage("Confirm password is required"),
  body("confirm_password").custom((v,{req}) => v === req.body.password).withMessage("Passwords do not match"),
  body("role").isIn(Object.values(Role)).withMessage("Invalid role"),
  // Optional fields accepted without strict requirements to avoid breaking existing flows
  body("user_name").optional().isString().trim().isLength({ min: 1, max: 30 }).withMessage("Invalid username"),
  body("first_name").optional().isString().trim().isLength({ min: 1, max: 50 }).withMessage("Invalid first name"),
  body("last_name").optional().isString().trim().isLength({ min: 1, max: 50 }).withMessage("Invalid last name"),
  body("stdId").optional().isString().trim().isLength({ min: 10, max: 10 }).withMessage("Invalid student id"),
  body("is_consent").optional().isBoolean().withMessage("Invalid consent flag"),
];

export const loginValidators = [
  body("user_name")
    .exists({ checkFalsy: true }).withMessage("Missing or invalid username")
    .bail()
    .isString().trim().withMessage("Missing or invalid username"),
  body("password")
    .exists({ checkFalsy: true }).withMessage("Missing or invalid password")
    .bail()
    .isString().withMessage("Missing or invalid password"),
];
