import { URL } from "url";
import * as net from "node:net";

export function encodeForHTML(input = ""): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function encodeForJSString(input = ""): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function truncateSafe(input = "", max = 200): string {
  const withoutCtl = input.replace(/[\u0000-\u001F]/g, "");
  return withoutCtl.slice(0, max);
}

export function sanitizeSvg(svg: string): string {
  // Placeholder: strip scriptable elements/attrs; prefer vetted libs if enabling SVG.
  // Repeat removal of dangerous container elements until stable
  let previous = "";
  while (previous !== svg) {
    previous = svg;
    svg = svg
      .replace(/<\/(?:script|style|foreignObject)\s*>/gi, "")
      .replace(/<(?:script|style|foreignObject)[^>]*>/gi, "");
  }
  let clean = svg;
  // Remove event handler attributes (multi-pass) until stable
  const eventAttrPatterns = [
    /\son[a-z]+\s*=\s*"[^"]*"/gi,
    /\son[a-z]+\s*=\s*'[^']*'/gi,
    /\son[a-z]+\s*=\s*[^\s>]+/gi,
  ];
  let prevClean = "";
  while (prevClean !== clean) {
    prevClean = clean;
    for (const pattern of eventAttrPatterns) {
      clean = clean.replace(pattern, "");
    }
  }
  // Remove javascript: href/src/xlink references (multi-pass not typically needed but safe)
  const jsHrefPatterns = [
    /\s(?:href|xlink:href|src)\s*=\s*"javascript:[^"]*"/gi,
    /\s(?:href|xlink:href|src)\s*=\s*'javascript:[^']*'/gi,
  ];
  for (const p of jsHrefPatterns) clean = clean.replace(p, "");
  return clean;
}

function isPrivateHostname(hostname: string): boolean {
  if (hostname === "localhost") return true;
  return false;
}

function isPrivateIP(host: string): boolean {
  if (!net.isIP(host)) return false;
  // IPv4 private ranges
  const parts = host.split(".").map(Number);
  if (parts.length === 4) {
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 172 && typeof b === 'number' && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 127) return true; // loopback
  }
  // IPv6 loopback
  if (host === "::1") return true;
  return false;
}

export function validateExternalUrl(raw: string, allowlist: string[] = []): string {
  let u: URL;
  try { u = new URL(raw); } catch { throw new Error("Invalid URL"); }

  const allowedProtocols = new Set(["http:", "https:"]);
  if (!allowedProtocols.has(u.protocol)) throw new Error("Blocked protocol");

  if (isPrivateHostname(u.hostname) || isPrivateIP(u.hostname)) {
    throw new Error("Blocked internal address");
  }

  if (allowlist.length) {
    const hostAllowed = allowlist.some((allowed) => u.hostname === allowed || u.hostname.endsWith(`.${allowed}`));
    if (!hostAllowed) throw new Error("Domain not allowlisted");
  }

  // Block non-standard ports unless explicitly allowlisted via domain policy
  const defaultPort = u.protocol === "http:" ? "80" : u.protocol === "https:" ? "443" : "";
  if (u.port && u.port !== defaultPort) throw new Error("Port not allowed");

  u.hash = "";
  return u.toString();
}
