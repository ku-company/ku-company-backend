import { expressjwt } from "express-jwt";
import type { Request } from "express";
import { decryptCookieValue } from "../utils/cookies.js";

// Defensive decode options: limit payload size indirectly by rejecting overly large headers via custom getToken logic if needed later.

const jwtMiddleware = expressjwt({
  secret: process.env.SECRET_KEY!,
  algorithms: ["HS256"],
  requestProperty: "user",
  getToken: (req: Request) => {
    // Check cookie first
    if (req.cookies && req.cookies.access_token) {
      const maybe = decryptCookieValue(req.cookies.access_token);
      return maybe || req.cookies.access_token;
    }
    // Fallback to Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      return req.headers.authorization.split(" ")[1];
    }
    return null;
  }
}).unless({
  path: ["/api/user/sign-up", "/api/user/login", "/api/user/refresh-token", "/google/sign-up"
    ,"/api/auth/google","/api/auth/google/callback", "/","/api/mock/findjob"]
});

// express-jwt already verifies signature & algorithm; export small helper to assert user object shape in downstream code.
export function ensureJwtUser(user: any) {
  if (!user || typeof user !== 'object') throw new Error('Invalid JWT payload');
  if (typeof user.id !== 'number') throw new Error('JWT payload missing id');
  if (typeof user.role !== 'string') throw new Error('JWT payload missing role');
  return user as { id: number; role: string; email?: string; verified?: boolean };
}

export default jwtMiddleware;