import jwt from 'jsonwebtoken';

// In-memory blacklist of revoked refresh tokens. Map token -> exp (epoch seconds)
const revoked = new Map<string, number>();
// Track issued refresh tokens per user for bulk revocation
const userTokens = new Map<number, Set<string>>();

export function registerRefreshToken(userId: number, token: string) {
  if (!token || !userId) return;
  let set = userTokens.get(userId);
  if (!set) {
    set = new Set<string>();
    userTokens.set(userId, set);
  }
  set.add(token);
}

export function revokeRefreshToken(token: string) {
  if (!token) return;
  try {
    const decoded = jwt.decode(token) as any;
    const exp = typeof decoded?.exp === 'number' ? decoded.exp : Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
    revoked.set(token, exp);
    const uid = typeof decoded?.id === 'number' ? decoded.id : undefined;
    if (uid && userTokens.has(uid)) {
      userTokens.get(uid)!.delete(token);
    }
  } catch {
    // if decode fails, still store with default 7d expiry
    const exp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
    revoked.set(token, exp);
  }
}

export function revokeAllTokensForUser(userId: number) {
  const set = userTokens.get(userId);
  if (!set) return;
  for (const token of set) {
    revokeRefreshToken(token);
  }
  userTokens.delete(userId);
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
