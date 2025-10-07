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

dotenv.config();
const port = process.env.PORT || 8000;
const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use(jwtMiddleware);
app.use("/api/mock", mockRouter);
app.use("/api/user", userRouter)
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/employee", authorizeRole("Student", "Alumni", "Admin"), employeeRouter );
app.use("/api/company", authorizeRole("Company"), companyRouter);
app.use("/api/job-postings", companyJobPostingRouter); // feed job postings


app.get("/", (req, res) => {
  res.send("Server is running");
});


// test connecting to db
app.get("/setup", async (req, res) => {
  try {
    const result = await pool.query("SELECT current_database()");
    console.log("Connected to:", result.rows[0].current_database);
    res.send(`Connected to DB: ${result.rows[0].current_database}`);
  } catch (err) {
    console.error("Connection error:", err);
    res.status(500).send("Database connection failed");
  }
});

app.get("/image", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Upload Image</title>
      </head>
      <body>
        <h1>Upload an Image</h1>
        <form action="/api/company/profile/image" method="POST" enctype="multipart/form-data">
          <input type="file" name="profile_image" accept="image/*" required />
          <button type="submit">Upload</button>
        </form>
      </body>
    </html>
  `);
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

