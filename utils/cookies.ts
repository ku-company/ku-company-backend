import type { Response } from "express";
import crypto from "node:crypto";

function isSecureEnv() {
  return process.env.NODE_ENV === 'production' || process.env.FORCE_SECURE_COOKIES === 'enabled';
}

function shouldSetHostPrefix() {
  return (process.env.COOKIE_PREFIX_MODE || '').toLowerCase() === 'host';
}

function shouldSetSecurePrefix() {
  return (process.env.COOKIE_PREFIX_MODE || '').toLowerCase() === 'secure';
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const secure = isSecureEnv();
  const encAccess = encryptCookieValue(accessToken);
  const encRefresh = encryptCookieValue(refreshToken);
  // Base cookies (kept for backward compatibility and tests)
  res.cookie("access_token", encAccess, {
    httpOnly: true,
    maxAge: 15 * 60 * 1000,
    sameSite: 'strict',
    secure,
    path: '/',
  });
  res.cookie("refresh_token", encRefresh, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'strict',
    secure,
    path: '/',
  });

  // Optionally set prefixed cookies for stronger browser guarantees
  if (secure && shouldSetHostPrefix()) {
    res.cookie("__Host-access_token", encAccess, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      sameSite: 'strict',
      secure: true,
      path: '/',
    });
    res.cookie("__Host-refresh_token", encRefresh, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      secure: true,
      path: '/',
    });
  } else if (secure && shouldSetSecurePrefix()) {
    res.cookie("__Secure-access_token", encAccess, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      sameSite: 'strict',
      secure: true,
      path: '/',
    });
    res.cookie("__Secure-refresh_token", encRefresh, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      secure: true,
      path: '/',
    });
  }
}

export function clearAuthCookies(res: Response) {
  const base = ["access_token", "refresh_token"]; 
  const prefixed: string[] = [];
  const mode = (process.env.COOKIE_PREFIX_MODE || '').toLowerCase();
  if (mode === 'host') {
    prefixed.push("__Host-access_token", "__Host-refresh_token");
  } else if (mode === 'secure') {
    prefixed.push("__Secure-access_token", "__Secure-refresh_token");
  }
  [...base, ...prefixed].forEach((name) => res.clearCookie(name, { path: '/' }));
}

// --- Cookie value encryption helpers ---

function getEncKey(): Buffer | null {
  const secret = process.env.COOKIE_ENCRYPTION_SECRET;
  if (!secret) return null;
  // derive 32-byte key from secret (supports arbitrary length)
  return crypto.createHash('sha256').update(secret, 'utf8').digest();
}

export function encryptCookieValue(value: string): string {
  const key = getEncKey();
  if (!key) return value; // fallback to plaintext if no secret configured
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // format: enc:<ivBase64>.<tagBase64>.<ctBase64>
  return `enc:${iv.toString('base64')}.${tag.toString('base64')}.${ciphertext.toString('base64')}`;
}

export function decryptCookieValue(value: string | undefined): string | undefined {
  if (!value) return value;
  if (!value.startsWith('enc:')) return value;
  const key = getEncKey();
  if (!key) return value; // cannot decrypt without key; return as-is for backward compat
  try {
    const [, payload] = value.split('enc:');
    if (!payload) return value;
    const parts = payload.split('.');
    if (parts.length !== 3) return value;
    const [ivB64, tagB64, ctB64] = parts as [string, string, string];
    const iv = Buffer.from(ivB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const ct = Buffer.from(ctB64, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
    return plaintext;
  } catch {
    // On failure, return original to avoid breaking flows with legacy cookies
    return value;
  }
}
