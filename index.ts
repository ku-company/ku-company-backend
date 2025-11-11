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

dotenv.config();
const port = process.env.PORT || 8000;
const app: Express = express();

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
      if (!origin) return callback(null, true); // allow same-origin or server-to-server
      if (allowedOrigins.length === 0) return callback(null, true); // permissive fallback if unset
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  }),
);
app.use(express.json());
// Optional CSRF protection (double-submit). Enable by setting CSRF_PROTECTION=enabled.
app.use(csrfProtection);
// Minimal security headers
app.use((_, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});
app.use(cookieParser());
app.use(passport.initialize());
// Request logging and correlation ID
app.use(requestLogging);
app.use("/api/ai", aiRouter);

app.use(jwtMiddleware);
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
