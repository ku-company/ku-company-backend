import { describe, it, expect } from "@jest/globals";
import * as fs from "node:fs";
import * as path from "node:path";
import { randomUUID } from "node:crypto";
import { appLogger, auditLogger } from "../../utils/logger.js";

function logsDir() {
  // logger.ts uses process.cwd() or PROJECT_ROOT_DIR for ROOT_DIR
  const root = process.env.PROJECT_ROOT_DIR || process.cwd();
  return path.join(root, "logs");
}

function readFileSafe(p: string): string {
  try {
    return fs.readFileSync(p, "utf8");
  } catch (_e) {
    return "";
  }
}

async function waitFor(predicate: () => boolean, timeoutMs = 1500, stepMs = 50) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (predicate()) return true;
    await new Promise((r) => setTimeout(r, stepMs));
  }
  return false;
}

describe("Logging persistence to disk", () => {
  it("appLogger and auditLogger append to their files and retain previous content", async () => {
    const dir = logsDir();
    const appFile = path.join(dir, "application.log");
    const secFile = path.join(dir, "security.log");

    const beforeApp = readFileSafe(appFile);
    const beforeSec = readFileSafe(secFile);

    const marker1 = `app-${randomUUID()}`;
    const marker2 = `sec-${randomUUID()}`;

    // Write two distinct lines to different log channels
    appLogger.info({ test: "log_persistence", marker: marker1 }, "log_persistence_test");
    auditLogger.info({ test: "log_persistence", marker: marker2 }, "audit_persistence_test");

    // Wait until both markers appear or timeout
    const ok = await waitFor(() => {
      const a = readFileSafe(appFile);
      const s = readFileSafe(secFile);
      return a.includes(marker1) && s.includes(marker2);
    });

    expect(ok).toBe(true);

    // Validate that content was appended (file length non-decreasing and markers present)
    const afterApp = readFileSafe(appFile);
    const afterSec = readFileSafe(secFile);

    expect(afterApp.length).toBeGreaterThanOrEqual(beforeApp.length);
    expect(afterSec.length).toBeGreaterThanOrEqual(beforeSec.length);
    expect(afterApp).toContain(marker1);
    expect(afterSec).toContain(marker2);
  });
});
