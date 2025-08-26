import express from "express";
import mockRouter  from "./router/mockRoutes.js";
import userRouter from "./router/userRoutes.js"
import cors from "cors";
import type { Express , Request, Response }  from "express";
import dotenv from "dotenv";
import pool from "./config/db.js";
import authRoutes from "./router/auth.js";
import passport from "passport";

import session from "express-session";
import cookieParser from "cookie-parser";
import "./utils/auth.js"; 
dotenv.config();
const port = process.env.PORT || 8000;
const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(session(
  {
    secret: process.env.SECRET || "default_secret",
    saveUninitialized: false,
    resave:false,
    cookie:
    {maxAge: 60000 * 60} // 1 hour
  }
));
app.use(passport.initialize());
app.use(passport.session());

function isLoggedIn(req: Request, res: Response, next: Function) {
  if (req.user) {
    return next();
  }
  res.sendStatus(401);
}

app.use("/api/mock", mockRouter);
app.use("/api/user", userRouter)
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/test-auth", (req, res) => {
  // console.log(req.session);
  // console.log(req.session.id);
  res.send("<a href=\"/auth/google\">Authenticate with Google</a>");

});


app.get("/protected", isLoggedIn, (req, res) => {
  if (req.user && typeof req.user === "object" && "displayName" in req.user) {
    res.send(`protect hi ${(req.user as any).displayName}`);
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

