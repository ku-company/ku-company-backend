/**
 * Audit Logging Tests
 *
 * Verifies:
 * 1. Successful login emits auth.login success audit event.
 * 2. Failed login (invalid credentials) emits auth.login failure audit event.
 * 3. Role-based access denial emits access_denied audit event.
 *
 * We mock the logger utilities to intercept audit events without writing files.
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// --- Mocks ------------------------------------------------------------------

// Mock logger utilities so we can assert on audit calls.
// Using vi (Vitest style) replaced by jest in ts-jest; jest globals already available via preset.
jest.mock("../../utils/logger.js", () => {
  const logAuthEvent = jest.fn();
  const logAccessDenied = jest.fn();
  // appLogger/auditLogger stubs (avoid file I/O)
  const stubLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };
  return {
    __esModule: true,
    appLogger: stubLogger,
    auditLogger: stubLogger,
    logAuthEvent,
    logAccessDenied,
    logDataChange: jest.fn(),
    logUserStatusChange: jest.fn(),
    getOrCreateCorrelationId: (id?: string) => id || "test-corr",
  };
});

// Dynamic imports after mock setup
import { UserService } from "../../service/userService.js";
import authorizeRole from "../../middlewares/rolebasedMiddleware.js";
import * as Logger from "../../utils/logger.js";

// --- Helpers ----------------------------------------------------------------

function buildUserRepoMock(options: { validUser?: boolean; user?: any }) {
  return {
    is_valid_user: jest.fn().mockResolvedValue(options.validUser ?? true),
    get_user_by_userName: jest.fn().mockResolvedValue(
      options.user ?? {
        id: 42,
        user_name: "alice",
        email: "alice@example.com",
        role: "Student",
        verified: false,
        password_hash: "$2a$10$dummy",
      },
    ),
    // Unused by login but required by class for other methods, provide no-op mocks:
    is_valid_create_user: jest.fn(),
    get_user_by_email: jest.fn(),
    get_user_by_id: jest.fn(),
    update_password: jest.fn(),
    upload_profile_image: jest.fn(),
    delete_profile_image: jest.fn(),
    update_role: jest.fn(),
    get_profile: jest.fn(),
  };
}

function makeResponseMock() {
  const res: any = {};
  res.statusCode = 200;
  res.status = jest.fn().mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn().mockImplementation((body: any) => {
    res.body = body;
    return res;
  });
  res.setHeader = jest.fn();
  return res;
}

// --- Tests ------------------------------------------------------------------

describe("Audit Logging - Authentication and Access Denial", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("emits audit log for successful login", async () => {
    const service = new UserService();
    // Inject mock repository
    (service as any).userRepository = buildUserRepoMock({
      validUser: true,
    });

    const result = await service.login({
      user_name: "alice",
      password: "secret",
    });

    expect(result.access_token).toBeDefined();
    expect(Logger.logAuthEvent).toHaveBeenCalled();

    // Find the call with success true
    const calls = (Logger.logAuthEvent as any).mock.calls;
    const successCall = calls.find(
      (c: any[]) => c[0]?.event === "auth.login" && c[0]?.success === true,
    );
    expect(successCall).toBeTruthy();
    expect(successCall[0]).toMatchObject({
      event: "auth.login",
      success: true,
      email: "alice@example.com",
    });
  });

  it("emits audit log for failed login (invalid credentials)", async () => {
    const service = new UserService();
    (service as any).userRepository = buildUserRepoMock({
      validUser: false,
    });

    await expect(
      service.login({
        user_name: "alice",
        password: "wrong",
      }),
    ).rejects.toThrow("Invalid username or password");

    expect(Logger.logAuthEvent).toHaveBeenCalled();

    const failureCall = (Logger.logAuthEvent as any).mock.calls.find(
      (c: any[]) => c[0]?.event === "auth.login" && c[0]?.success === false,
    );
    expect(failureCall).toBeTruthy();
    expect(failureCall[0]).toMatchObject({
      event: "auth.login",
      success: false,
      reason: "Invalid username or password",
    });
  });

  it("emits access_denied audit log for unauthorized role", () => {
    const middleware = authorizeRole("Admin"); // Only Admin allowed
    const req: any = {
      originalUrl: "/api/employee",
      method: "GET",
      ip: "127.0.0.1",
      user: {
        id: 10,
        email: "user@example.com",
        role: "Student", // Not allowed
      },
      correlationId: "corr-123",
    };
    const res = makeResponseMock();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.body).toMatchObject({ message: "Access Denied" });
    expect(Logger.logAccessDenied).toHaveBeenCalled();

    const call = (Logger.logAccessDenied as any).mock.calls[0][0];
    expect(call).toMatchObject({
      userId: 10,
      email: "user@example.com",
      role: "Student",
      resource: "/api/employee",
      action: "GET",
      reason: "Role not authorized",
    });
  });
});
