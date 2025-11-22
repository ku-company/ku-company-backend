import * as ExpressPkg from "express";
import request from "../controller/_request.js";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// Mock the logger utilities so we can intercept correlation IDs without writing files.
// We force deterministic correlation ID generation for the "no incoming header" case.
jest.mock("../../utils/logger.js", () => {
  const info = jest.fn();
  const warn = jest.fn();
  const error = jest.fn();
  const debug = jest.fn();
  const stubLogger = {
    info,
    warn,
    error,
    debug,
    child: jest.fn().mockReturnThis(),
  };
  return {
    __esModule: true,
    appLogger: stubLogger,
    auditLogger: stubLogger,
    logAuthEvent: jest.fn(),
    logAccessDenied: jest.fn(),
    logDataChange: jest.fn(),
    logUserStatusChange: jest.fn(),
    // Deterministic correlation id when none provided
    getOrCreateCorrelationId: (existing?: string) =>
      existing || "generated-corr-id",
  };
});

// Import after mocks
import { requestLogging } from "../../middlewares/requestLogging.js";
import * as Logger from "../../utils/logger.js";

function buildApp() {
  const express: any = (ExpressPkg as any).default || (ExpressPkg as any);
  const app = express();
  app.use(requestLogging);
  app.get("/ping", (_req: any, res: any) => {
    res.json({ ok: true });
  });
  return app;
}

describe("Request Correlation ID Propagation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("preserves incoming X-Request-ID header and logs it", async () => {
    const app = buildApp();
    const incomingId = "client-corr-123";
    const res = await request(app)
      .get("/ping")
      .set("X-Request-ID", incomingId)
      .expect(200);

    // Header echoed back
    expect(res.headers["x-request-id"]).toBe(incomingId);

    // Logger should have been called twice (start + finish)
    const infoCalls = (Logger.appLogger.info as jest.Mock).mock.calls as any[];
    expect(infoCalls.length).toBeGreaterThanOrEqual(2);

    const startCallArg: any = infoCalls[0]?.[0];
    const finishCallArg: any = infoCalls[infoCalls.length - 1]?.[0];

    expect(startCallArg.correlationId).toBe(incomingId);
    expect(finishCallArg.correlationId).toBe(incomingId);
  });

  it("generates a correlation ID when none is provided and logs it consistently", async () => {
    const app = buildApp();
    const res = await request(app).get("/ping").expect(200);

    // Deterministic ID from our mock
    expect(res.headers["x-request-id"]).toBe("generated-corr-id");

    const infoCalls = (Logger.appLogger.info as jest.Mock).mock.calls as any[];
    expect(infoCalls.length).toBeGreaterThanOrEqual(2);

    const startCallArg: any = infoCalls[0]?.[0];
    const finishCallArg: any = infoCalls[infoCalls.length - 1]?.[0];

    expect(startCallArg.correlationId).toBe("generated-corr-id");
    expect(finishCallArg.correlationId).toBe("generated-corr-id");
  });

  it("does not log request body or PII in correlation metadata object", async () => {
    const app = buildApp();
    const res = await request(app)
      .get("/ping")
      .set("X-Request-ID", "privacy-check-1")
      .expect(200);

    expect(res.headers["x-request-id"]).toBe("privacy-check-1");

    const infoCalls = (Logger.appLogger.info as jest.Mock).mock.calls;
    const metadataObjects = infoCalls.map((c) => c[0]);

    for (const meta of metadataObjects) {
      // Ensure we only have expected keys; body should not appear
      expect(meta).not.toHaveProperty("body");
      expect(meta).not.toHaveProperty("password");
      expect(meta).not.toHaveProperty("access_token");
      expect(meta).not.toHaveProperty("refresh_token");
    }
  });
});
