import express from "express";
import mockRouter  from "./router/mockRoutes.js";
import userRouter from "./router/userRoutes.js"
import cors from "cors";
import type { Express }  from "express";
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

dotenv.config();
const port = process.env.PORT || 8000;
const app: Express = express();

app.use(cors({ origin: process.env.CLIENT_URL_DEV, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use("/api/ai", aiRouter)

app.use(jwtMiddleware);
app.use("/api/mock", mockRouter);
app.use("/api/user", userRouter)
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/employee", authorizeRole("Student", "Alumni", "Admin"), employeeRouter );
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
  console.log(`Server running at http://localhost:${port}`);
});

