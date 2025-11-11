import jwt from 'jsonwebtoken';

// Optional persistent token store (Redis) support.
// If process.env.TOKEN_STORE === 'redis' and REDIS_URL provided, we use Redis.
// Otherwise we fallback to the in-memory implementation. Public API remains unchanged.

interface TokenStore {
  register(userId: number, token: string): Promise<void> | void;
  revoke(token: string): Promise<void> | void;
  revokeAll(userId: number): Promise<void> | void;
  isRevoked(token: string): Promise<boolean> | boolean;
}

// In-memory implementation (default)
class InMemoryTokenStore implements TokenStore {
  private revoked = new Map<string, number>(); // token -> exp
  private userTokens = new Map<number, Set<string>>();

  register(userId: number, token: string) {
    if (!token || !userId) return;
    let set = this.userTokens.get(userId);
    if (!set) {
      set = new Set<string>();
      this.userTokens.set(userId, set);
    }
    set.add(token);
  }

  revoke(token: string) {
    if (!token) return;
    try {
      const decoded = jwt.decode(token) as any;
      const exp = typeof decoded?.exp === 'number'
        ? decoded.exp
        : Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
      this.revoked.set(token, exp);
      const uid = typeof decoded?.id === 'number' ? decoded.id : undefined;
      if (uid && this.userTokens.has(uid)) {
        this.userTokens.get(uid)!.delete(token);
      }
    } catch {
      const exp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
      this.revoked.set(token, exp);
    }
  }

  revokeAll(userId: number) {
    const set = this.userTokens.get(userId);
    if (!set) return;
    for (const token of set) {
      this.revoke(token);
    }
    this.userTokens.delete(userId);
  }

  isRevoked(token: string): boolean {
    if (!token) return false;
    const exp = this.revoked.get(token);
    if (exp === undefined) return false;
    if (exp < Math.floor(Date.now() / 1000)) {
      this.revoked.delete(token);
      return false;
    }
    return true;
  }
}

// Redis implementation (lazy connect). We avoid importing unless needed to keep optional dependency semantics.
class RedisTokenStore implements TokenStore {
  private clientPromise: Promise<any>;
  private readonly prefix = 'refresh:';
  private readonly userPrefix = 'user_tokens:';

  constructor(url: string) {
    // Dynamic import via Function constructor to avoid TS module resolution at build time.
    const importDynamic = new Function('m', 'return import(m)') as (m: string) => Promise<any>;
    this.clientPromise = importDynamic('ioredis').then(mod => new mod.default(url));
  }

  private async client() {
    return this.clientPromise;
  }

  async register(userId: number, token: string) {
    if (!token || !userId) return;
    const decoded = jwt.decode(token) as any;
    const expSeconds = typeof decoded?.exp === 'number'
      ? decoded.exp - Math.floor(Date.now() / 1000)
      : 7 * 24 * 60 * 60; // default 7d
    const ttl = Math.max(expSeconds, 60); // ensure minimum TTL
    const c = await this.client();
    await c.sadd(this.userPrefix + userId, token);
    // We don't mark revoked yet; this is issuance tracking only.
    await c.expire(this.userPrefix + userId, ttl);
  }

  async revoke(token: string) {
    if (!token) return;
    const decoded = jwt.decode(token) as any;
    const expSeconds = typeof decoded?.exp === 'number'
      ? decoded.exp - Math.floor(Date.now() / 1000)
      : 7 * 24 * 60 * 60;
    const ttl = Math.max(expSeconds, 60);
    const c = await this.client();
    // Store revoked token key with TTL. Value is '1'.
    await c.set(this.prefix + token, '1', 'EX', ttl);
    const uid = typeof decoded?.id === 'number' ? decoded.id : undefined;
    if (uid) {
      await c.srem(this.userPrefix + uid, token);
    }
  }

  async revokeAll(userId: number) {
    const c = await this.client();
    const key = this.userPrefix + userId;
    const tokens: string[] = await c.smembers(key);
    if (tokens && tokens.length) {
      for (const t of tokens) {
        await this.revoke(t);
      }
    }
    // remove set (best-effort)
    await c.del(key);
  }

  async isRevoked(token: string): Promise<boolean> {
    if (!token) return false;
    const c = await this.client();
    const res = await c.exists(this.prefix + token);
    return res === 1;
  }
}

let store: TokenStore;
try {
  if (process.env.TOKEN_STORE === 'redis' && process.env.REDIS_URL) {
    store = new RedisTokenStore(process.env.REDIS_URL);
  } else {
    store = new InMemoryTokenStore();
  }
} catch {
  // Fallback to memory on any initialization error
  store = new InMemoryTokenStore();
}

// Public API (unchanged signatures)
export function registerRefreshToken(userId: number, token: string) {
  return store.register(userId, token) as any;
}

export function revokeRefreshToken(token: string) {
  return store.revoke(token) as any;
}

export function revokeAllTokensForUser(userId: number) {
  return store.revokeAll(userId) as any;
}

export function isRefreshTokenRevoked(token: string): boolean | Promise<boolean> {
  return store.isRevoked(token);
}

// Utility: determine if backing store is persistent (for diagnostics)
export function tokenStoreType(): 'memory' | 'redis' {
  return store instanceof RedisTokenStore ? 'redis' : 'memory';
}
