import { body } from "express-validator";
import { Role } from "../utils/enums.js";
import { isCommonPassword } from "../utils/passwordBlacklist.js";

// Relaxed to match existing controller tests and service contracts
export const signUpValidators = [
  body("email").isString().isEmail().withMessage("Invalid email"),
  body("password").isString().withMessage("Password is required"),
  body("password").isString().isLength({ min: 8, max: 15 }).withMessage("Password must be 8-15 characters long"),
  body("password").custom((v) => !isCommonPassword(v)).withMessage("Password is too common; choose a stronger password"),
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

export const changePasswordValidators = [
  body("current_password")
    .exists({ checkFalsy: true }).withMessage("Current password is required")
    .bail()
    .isString().withMessage("Current password is required"),
  body("new_password")
    .exists({ checkFalsy: true }).withMessage("New password is required")
    .bail()
    .isString().isLength({ min: 8, max: 15 }).withMessage("Password must be 8-15 characters long"),
  body("new_password").custom((v) => !isCommonPassword(v)).withMessage("Password is too common; choose a stronger password"),
  body("confirm_new_password")
    .exists({ checkFalsy: true }).withMessage("Confirm new password is required")
    .bail()
    .custom((v,{req}) => v === req.body.new_password).withMessage("Passwords do not match"),
];
