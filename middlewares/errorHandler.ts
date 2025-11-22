import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { appLogger, auditLogger } from "../utils/logger.js";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const correlationId = (req as any).correlationId;

  if (err instanceof multer.MulterError) {
    // Handle Multer errors
    let message = "File upload error";
    if (err.code === "LIMIT_FILE_SIZE") message = "File size is too large.";
    if (err.code === "LIMIT_FILE_COUNT") message = "File limit reached";
    if (err.code === "LIMIT_UNEXPECTED_FILE") message = "Wrong file type";

    appLogger.warn({
      msg: "Multer error",
      code: err.code,
      field: (err as any).field,
      correlationId,
    });

    return res
      .type("application/json")
      .status(400)
      .json({ error: message, request_id: correlationId });
  }

  // Known client errors (4xx), using common status fields if present
  const status = (err && ((err as any).status || (err as any).statusCode)) as
    | number
    | undefined;
  if (status && status >= 400 && status < 500) {
    appLogger.warn({
      msg: "Handled client error",
      status,
      errorMessage: err?.message,
      correlationId,
    });
    return res
      .type("application/json")
      .status(status)
      .json({
        error: err?.message || "Bad Request",
        request_id: correlationId,
      });
  }
  // Handle other errors
  appLogger.error({
    msg: "Unhandled server error",
    correlationId,
    stack: process.env.NODE_ENV === "production" ? undefined : err?.stack,
  });
  auditLogger.error({ type: "server_error", correlationId }, "Server error");
  return res
    .type("application/json")
    .status(500)
    .json({ error: "Internal Server Error", request_id: correlationId });
};

export default errorHandler;
