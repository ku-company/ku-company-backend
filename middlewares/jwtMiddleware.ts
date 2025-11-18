import { expressjwt } from "express-jwt";

const jwtMiddleware = expressjwt({
  secret: process.env.SECRET_KEY!,
  algorithms: ["HS256"],
  requestProperty: "user",
  getToken: (req) => {
    // Fallback to Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      return req.headers.authorization.split(" ")[1];
    }
    // Check cookie f
    if (req.cookies && req.cookies.access_token) {
      return req.cookies.access_token;
    }
    return null;
  }
}).unless({
  path: ["/api/user/sign-up", "/api/user/login", "/api/user/refresh-token", "/google/sign-up"
    ,"/api/auth/google","/api/auth/google/callback", "/","/api/mock/findjob"]
});

export default jwtMiddleware;