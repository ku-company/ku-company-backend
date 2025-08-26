import express from "express";
import mockRouter  from "./router/mockRoutes.js";
import userRouter from "./router/userRoutes.js"
import cors from "cors";
import type { Express , Request, Response }  from "express";
import dotenv from "dotenv";
import pool from "./config/db.js";

dotenv.config();
const port = process.env.PORT || 8000;
const app: Express = express();

app.use(cors());
app.use(express.json());

app.use("/api/mock", mockRouter);
app.use("/api/user", userRouter)


app.get("/", (req, res) => {
  res.send("Server is running ok!");
});

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

