import type { Request, Response, NextFunction } from "express";
import { appLogger, getOrCreateCorrelationId } from "../utils/logger.js";

// Augment Express Request to include correlationId
declare module "express-serve-static-core" {
  interface Request {
    correlationId?: string;
  }
}

/**
 * Request logging middleware with correlation IDs and structured logs.
 * - Generates or accepts an incoming X-Request-ID
 * - Logs request start and completion with duration
 * - All timestamps are UTC ISO 8601 (from logger config)
 */
export function requestLogging(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // Generate or use incoming correlation ID
  const incomingId = (req.headers["x-request-id"] as string | undefined) || undefined;
  req.correlationId = getOrCreateCorrelationId(incomingId);

  // Echo correlation ID back to client
  res.setHeader("X-Request-ID", req.correlationId);

  // Log request start (do not log bodies to avoid PII leakage)
  appLogger.info({
    msg: "Incoming request",
    method: req.method,
    url: req.originalUrl,
    correlationId: req.correlationId,
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  });

  // When the response finishes, log completion and duration
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    appLogger.info({
      msg: "Request completed",
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      correlationId: req.correlationId
    });
  });

  // Also track abnormal termination
  res.on("close", () => {
    if (!res.writableEnded) {
      const durationMs = Date.now() - start;
      appLogger.warn({
        msg: "Request closed before completion",
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
        correlationId: req.correlationId
      });
    }
  });

  next();
}

export default requestLogging;
