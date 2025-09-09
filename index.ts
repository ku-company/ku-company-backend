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
import authorizeRole from "./middlewares/rolebasedMiddleware.js";
import path from "path";
import { fileURLToPath } from "url";

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
app.use("/api/company", authorizeRole("Company"), companyRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve Images folder
app.use("/Images", express.static(path.join(__dirname, "../Images")));

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/google/sign-up", (req, res) => {
  res.send("<a href=\"/api/auth/google\">Authenticate with Google</a>");
  // simulate with role
  // res.send("<a href=\"/api/auth/google?role=Student\">Authenticate with Google</a>");

});


app.get("/protected", (req, res) => {
  if (req.user) {
    console.log("user protected:", req.user);
    res.send(`protected hi ${(req.user as any).user_name}`);
  } else {
    res.send("User information not available");
  }
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

