import express from "express";
import mockRouter  from "./router/mockRoutes.js";
import userRouter from "./router/userRoutes.js"
import cors from "cors";
import type { Express , NextFunction, Request, Response }  from "express";
import dotenv from "dotenv";
import pool from "./config/db.js";
import authRouter from "./router/authRoutes.js";
import passport from "passport";
import cookieParser from "cookie-parser";
import "./utils/auth.js"; 
import { expressjwt } from "express-jwt";

dotenv.config();
const port = process.env.PORT || 8000;
const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());


const jwtMiddleware = expressjwt({
  secret: process.env.SECRET_KEY!,
  algorithms: ["HS256"],
  requestProperty: "user",
  getToken: (req) => {
    // Check cookie first
    if (req.cookies && req.cookies.access_token) {
      return req.cookies.access_token;
    }
    // Fallback to Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      return req.headers.authorization.split(" ")[1];
    }
    return null;
  }
}).unless({
  path: ["/api/user/sign-up", "/api/user/login", "/api/user/refresh-token", "/google/sign-up"
    ,"/api/auth/google","/api/auth/google/callback"]
});

app.use(cookieParser());
app.use(jwtMiddleware);
app.use("/api/mock", mockRouter);
app.use("/api/user", userRouter)
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/google/sign-up", (req, res) => {
  res.send("<a href=\"/api/auth/google\">Authenticate with Google</a>");

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


// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

