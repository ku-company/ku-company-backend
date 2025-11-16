import express from "express";
import mockRouter from "./router/mockRoutes.js";
import userRouter from "./router/userRoutes.js";
import { swaggerSpec, swaggerUi } from "./swagger.js";
import expressOasGenerator from "express-oas-generator";
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

// Strict CORS allowlist with safe same-origin allowances for Swagger UI
const selfHttp = `http://localhost:${port}`;
const selfHttp127 = `http://127.0.0.1:${port}`;
const allowedOrigins = Array.from(
  new Set(
    [
      ...(process.env.ALLOWED_ORIGINS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      process.env.CLIENT_URL_DEV || "",
      selfHttp,
      selfHttp127,
    ].filter(Boolean),
  ),
);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin (same-origin or server-to-server tools like curl/Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow Safari/Chrome same-origin POSTs from Swagger UI when Origin header is sent
      // by explicitly whitelisting our own origin derived above
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/openapi.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});
// Parse cookies before CSRF so middleware can read csrf_token
app.use(cookieParser());
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
app.use("/api/company", authorizeRole("Company", "Admin"), companyRouter);
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
