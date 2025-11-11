import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

// Lightweight CSRF protection with double-submit cookie pattern.
// Enabled only when process.env.CSRF_PROTECTION === 'enabled' to avoid breaking tests.
// For state-changing methods, require header X-CSRF-Token to match cookie csrf_token.

const CSRF_COOKIE = 'csrf_token';
const HEADER_NAME = 'x-csrf-token';
const METHODS_REQUIRING_CSRF = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (process.env.CSRF_PROTECTION !== 'enabled') return next();

  // Issue CSRF token cookie for safe methods if missing
  const method = (req.method || 'GET').toUpperCase();
  const hasCookie = Boolean((req as any).cookies?.[CSRF_COOKIE]);
  if (!hasCookie && (method === 'GET' || method === 'HEAD' || method === 'OPTIONS')) {
    res.cookie(CSRF_COOKIE, generateToken(), { httpOnly: false, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
    return next();
  }

  if (!METHODS_REQUIRING_CSRF.has(method)) return next();

  const header = (req.headers[HEADER_NAME] as string | undefined) || (req.headers[HEADER_NAME.toUpperCase()] as string | undefined);
  const cookie = (req as any).cookies?.[CSRF_COOKIE];
  if (!cookie || !header || cookie !== header) {
    return res.status(403).json({ message: 'CSRF token missing or invalid' });
  }
  next();
}
