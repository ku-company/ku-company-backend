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
app.use(session(
  {
    secret: "helpme", // change later do not expose
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

app.use("/api/auth", authRoutes);
app.use(cookieParser());
// app.get("/", (req, res) => {
//   res.send("Server is running ok!");
// });

app.get("/", (req, res) => {
  // console.log(req.session);
  // console.log(req.session.id);
  res.send("<a href=\"/auth/google\">Authenticate with Google</a>");

});

app.get("/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get("/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/protected",
    failureRedirect: "/auth/failure"
  })
);

app.get("/auth/failure", (req: Request, res: Response) => {
  res.send("Authentication failed");
});

app.get("/protected", isLoggedIn, (req, res) => {
  if (req.user && typeof req.user === "object" && "displayName" in req.user) {
    res.send(`protect hi ${(req.user as any).displayName}`);
  } else {
    res.send("User information not available");
  }
});

// app.get("/success", (req: Request, res: Response) => {
//   // Initiate Google OAuth2 authentication
//   try {
//     res.send("Session successfully set");
//   } catch (error) {
//     res.json({ error: error.message });
//   }
// });

// app.get("/user", async (req, res) => {
//   try{
//     const sessionCookie = req.cookies.session || "";
//     if (!sessionCookie) throw new Error("Unauthorized go log in");
//     return res.json({ message: "You are authenticated", sessionCookie });
//   }catch(error){
//     return res.json({ error: error.message });
//   }
// });




app.post("/test-db", async (req, res) => {
  try {
    await pool.query("CREATE TABLE test (id SERIAL PRIMARY KEY, name VARCHAR(100))");
    res.send("Test table created");
  } catch (err) {
    console.error("Test query error:", err);
    res.status(500).send("Test query failed");
  }
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM test");
    res.send(result.rows);
  } catch (err) {
    console.error("Test query error:", err);
    res.status(500).send("Test query failed");
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

