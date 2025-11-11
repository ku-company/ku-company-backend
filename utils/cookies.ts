import type { Response } from "express";

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
  // Base cookies (kept for backward compatibility and tests)
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    maxAge: 15 * 60 * 1000,
    sameSite: 'strict',
    secure,
    path: '/',
  });
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'strict',
    secure,
    path: '/',
  });

  // Optionally set prefixed cookies for stronger browser guarantees
  if (secure && shouldSetHostPrefix()) {
    res.cookie("__Host-access_token", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      sameSite: 'strict',
      secure: true,
      path: '/',
    });
    res.cookie("__Host-refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      secure: true,
      path: '/',
    });
  } else if (secure && shouldSetSecurePrefix()) {
    res.cookie("__Secure-access_token", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      sameSite: 'strict',
      secure: true,
      path: '/',
    });
    res.cookie("__Secure-refresh_token", refreshToken, {
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
