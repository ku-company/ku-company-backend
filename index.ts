import express from "express";
import mockRouter from "./router/mockRoutes.js";
import userRouter from "./router/userRoutes.js";
import cors from "cors";
import type { Express } from "express";
import dotenv from "dotenv";
import pool from "./config/db.js";
import authRouter from "./router/authRoutes.js";
import passport from "passport";
import cookieParser from "cookie-parser";
import "./utils/auth.js";
import jwtMiddleware from "./middlewares/jwtMiddleware.js";
import adminRouter from "./router/adminRoutes.js";
import companyRouter from "./router/companyRoutes.js";
import employeeRouter from "./router/employeeRoutes.js";
import authorizeRole from "./middlewares/rolebasedMiddleware.js";
import companyJobPostingRouter from "./router/jobPostingPublicRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import professorRouter from "./router/professorRoutes.js";
import professorAnnouncementRouter from "./router/announcementFeedPublicRoutes.js";
import aiRouter from "./router/aiRoutes.js";
import { csrfProtection } from "./middlewares/csrf.js";
import { requestLogging } from "./middlewares/requestLogging.js";
import { appLogger } from "./utils/logger.js";

// Load environment variables before reading them
dotenv.config();

// Optional HTTPS redirect & HSTS hardening
const FORCE_HTTPS = process.env.FORCE_HTTPS === 'enabled';
const HSTS_MAX_AGE = Number(process.env.HSTS_MAX_AGE || 31536000); // 1 year default
const port = process.env.PORT || 8000;
const app: Express = express();
// Always trust proxy so req.secure reflects X-Forwarded-Proto when behind a TLS terminator (NGINX/ELB)
if (!app.get('trust proxy')) app.set('trust proxy', 1);

// Strict CORS allowlist: ALLOWED_ORIGINS (comma-separated) or fallback to CLIENT_URL_DEV
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  process.env.CLIENT_URL_DEV ||
  ""
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      // Fail-safe default: deny unless explicitly allowed
      // Allow requests without Origin (same-origin/server-to-server tools like curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  }),
);
app.use(express.json());
// Parse cookies before CSRF so middleware can read csrf_token
app.use(cookieParser());
// Optional CSRF protection (double-submit). Enable by setting CSRF_PROTECTION=enabled.
app.use(csrfProtection);
// Minimal security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Basic clickjacking & MIME sniff protections (defense in depth)
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  // Lock down powerful browser APIs by default
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // Conservative Content Security Policy suitable for an API server
  // This reduces the risk of browser-based injection if any HTML is accidentally served
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
  // Disallow Flash/Adobe cross-domain policies
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  // If FORCE_HTTPS is enabled, redirect plain HTTP to HTTPS
  if (FORCE_HTTPS && !req.secure) {
    const host = req.headers.host;
    return res.redirect(301, `https://${host}${req.originalUrl}`);
  }
  // Include HSTS when the request is already over HTTPS (regardless of redirect setting)
  if (req.secure) {
    res.setHeader("Strict-Transport-Security", `max-age=${HSTS_MAX_AGE}; includeSubDomains`);
  }
  next();
});
app.use(passport.initialize());
// Request logging and correlation ID
app.use(requestLogging);
app.use("/api/ai", aiRouter);

app.use(jwtMiddleware);
// Prevent caching of authenticated responses to reduce risk of sensitive data stored in browser caches
app.use((req, res, next) => {
  if ((req as any).user) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
  next();
});
app.use("/api/mock", mockRouter);
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use(
  "/api/employee",
  authorizeRole("Student", "Alumni", "Admin"),
  employeeRouter,
);
app.use("/api/company", authorizeRole("Company"), companyRouter);
app.use("/api/job-postings", companyJobPostingRouter); // public feed job postings
app.use("/api/professor", professorRouter);
app.use("/api/announcements", professorAnnouncementRouter); // public feed announcements

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use(errorHandler);

// Start server
app.listen(port, () => {
  appLogger.info({
    msg: "Server started",
    port,
    timestamp: new Date().toISOString(),
  });
});
