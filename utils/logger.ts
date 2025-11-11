import pino from "pino";
import * as fs from "node:fs";
import * as path from "node:path";
import { randomUUID } from "crypto";

// Resolve project root in a way that works for both ESM and Jest transpilation.
// Avoid using import.meta to keep compatibility with ts-jest and CJS transforms.
// In containers and local runs, WORKDIR/CWD is the project root.
const ROOT_DIR = process.env.PROJECT_ROOT_DIR ?? process.cwd();

// Ensure logs directory exists (deterministic location under project root)
const LOG_DIR = path.join(ROOT_DIR, "logs");
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Controls pretty console output in non-production without requiring pino-pretty by default.
// Enable by setting PRETTY_LOGS=true and installing pino-pretty.
const isProd = process.env.NODE_ENV === "production";
const enablePretty =
  !isProd &&
  (process.env.PRETTY_LOGS === "true" || process.env.PRETTY_LOGS === "1");

// Build transport targets safely (avoid requiring pino-pretty unless enabled)
function buildAppTransports(destinationFile: string) {
  const targets: any[] = [
    {
      target: "pino/file",
      options: { destination: destinationFile, mkdir: true, append: true },
    },
  ];

  if (enablePretty) {
    // Pretty-print to stdout if available and enabled
    targets.push({
      target: "pino-pretty",
      options: { colorize: true, translateTime: "SYS:standard" },
    });
  }

  return pino.transport({ targets });
}

// Common redaction for sensitive data
const redaction = {
  paths: [
    "req.headers.authorization",
    "*.password",
    "*.password_hash",
    "password",
    "password_hash",
    "access_token",
    "refresh_token",
    "token",
  ],
  censor: "[REDACTED]",
};

// Core application logger (general events)
export const appLogger = pino(
  {
    level: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),
    redact: redaction,
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
    formatters: {
      level(label) {
        return { level: label };
      },
    },
  },
  buildAppTransports(path.join(LOG_DIR, "application.log")),
);

// Dedicated audit logger for security events (repudiation protection)
export const auditLogger = pino(
  {
    level: "info",
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
    base: { channel: "security_audit" },
  },
  buildAppTransports(path.join(LOG_DIR, "security.log")),
);

// Generate or extract request correlation ID
export function getOrCreateCorrelationId(existing?: string): string {
  if (existing && typeof existing === "string" && existing.length <= 128)
    return existing;
  return randomUUID();
}

// Optional child logger creator to bind context like correlationId, userId, etc.
export function createChildLogger(bindings: Record<string, unknown>) {
  return appLogger.child(bindings);
}

// ---- Audit event helpers ----

export type AuditAuthEvent = {
  event: "auth.login" | "auth.logout" | "auth.refresh" | "auth.signup";
  userId?: number;
  email?: string;
  success: boolean;
  reason?: string;
  ip?: string;
  correlationId: string;
};

export function logAuthEvent(e: AuditAuthEvent) {
  auditLogger.info(
    {
      type: "auth",
      ...e,
      occurredAt: new Date().toISOString(),
    },
    "Authentication event",
  );
}

export function logAccessDenied(opts: {
  userId?: number | undefined;
  email?: string | undefined;
  role?: string | undefined;
  resource: string;
  action: string;
  reason: string;
  ip?: string | undefined;
  correlationId: string;
}) {
  auditLogger.warn(
    {
      type: "access_denied",
      ...opts,
      occurredAt: new Date().toISOString(),
    },
    "Access denied",
  );
}

export function logDataChange(opts: {
  userId?: number;
  entity: string;
  entityId?: number | string;
  operation: "create" | "update" | "delete";
  changedFields?: string[];
  ip?: string;
  correlationId: string;
}) {
  auditLogger.info(
    {
      type: "data_change",
      ...opts,
      occurredAt: new Date().toISOString(),
    },
    "Data change",
  );
}

export function logUserStatusChange(opts: {
  adminId?: number;
  targetUserId: number;
  previousStatus?: string;
  newStatus: string;
  previousVerified?: boolean;
  newVerified?: boolean;
  correlationId: string;
}) {
  auditLogger.info(
    {
      type: "user_status_change",
      ...opts,
      occurredAt: new Date().toISOString(),
    },
    "User status/verification change",
  );
}
