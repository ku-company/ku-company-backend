import express from "express";
import mockRouter  from "./router/mockRoutes.js";
import userRouter from "./router/userRoutes.js"
import cors from "cors";
import type { Express , NextFunction, Request, Response }  from "express";
import dotenv from "dotenv";
import pool from "./config/db.js";
import authRoutes from "./router/auth.js";
import passport from "passport";
import cookieParser from "cookie-parser";
import "./utils/auth.js"; 
import jwt from "jsonwebtoken";
dotenv.config();
const port = process.env.PORT || 8000;
const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());


function verifyJwt(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.access_token;
  if (!token) return res.sendStatus(401);

  try {
    const payload = jwt.verify(token, process.env.SECRET_KEY!);
    req.user = payload;
    next();
  } catch {
    res.sendStatus(401);
  }
}

app.use("/api/mock", mockRouter);
app.use("/api/user", userRouter)
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/google/sign-in", (req, res) => {
  res.send("<a href=\"/auth/google\">Authenticate with Google</a>");

});


app.get("/protected", verifyJwt, (req, res) => {
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

