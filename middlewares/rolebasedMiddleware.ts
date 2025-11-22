import type { Request, Response, NextFunction, RequestHandler } from "express";
import { logAccessDenied } from "../utils/logger.js";

const authorizeRole = (...allowedRoles: string[]): RequestHandler => {
  return (req, res, next) => {
    const u = (req as any).user as
      | { id?: number; email?: string; role?: string }
      | undefined;
    const role = u?.role;
    if (!role || !allowedRoles.includes(role)) {
      logAccessDenied({
        userId: u?.id,
        email: u?.email,
        role,
        resource: req.originalUrl,
        action: req.method,
        reason: "Role not authorized",
        ip: req.ip,
        correlationId: (req as any).correlationId || "no-corr",
      });
      return res.status(401).json({
        message: "Access Denied",
        request_id: (req as any).correlationId,
      });
    }
    next();
  };
};

export default authorizeRole;
