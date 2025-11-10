import { validationResult } from "express-validator";
import type { Request, Response, NextFunction } from "express";

export function validationHandler(req: Request, res: Response, next: NextFunction) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const firstError = result.array({ onlyFirstError: true })[0];
  if (!firstError) {
    return res.status(400).json({ message: "Validation error" });
  }
  // Different error shapes; pull common fields
  const fieldName = (firstError as any).path || (firstError as any).param || "unknown";
  return res.status(400).json({ message: firstError.msg, field: fieldName });
}
