import jwt from 'jsonwebtoken';

// In-memory blacklist of revoked refresh tokens. Map token -> exp (epoch seconds)
const revoked = new Map<string, number>();

export function revokeRefreshToken(token: string) {
  if (!token) return;
  try {
    const decoded = jwt.decode(token) as any;
    const exp = typeof decoded?.exp === 'number' ? decoded.exp : Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
    revoked.set(token, exp);
  } catch {
    // if decode fails, still store with default 7d expiry
    const exp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
    revoked.set(token, exp);
  }
}

export function isRefreshTokenRevoked(token: string): boolean {
  if (!token) return false;
  const exp = revoked.get(token);
  if (exp === undefined) return false;
  // Cleanup expired entries lazily
  if (exp < Math.floor(Date.now() / 1000)) {
    revoked.delete(token);
    return false;
  }
  return true;
}
