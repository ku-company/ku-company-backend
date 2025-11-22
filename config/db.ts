import pkg from "pg";
import { appLogger } from "../utils/logger.js";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use DATABASE_URL from Docker env
});

pool.on("connect", () => {
  appLogger.info({
    msg: "Connected to the database",
    timestamp: new Date().toISOString(),
  });
});

pool.on("error", (err) => {
  appLogger.error({
    msg: "Database connection error",
    error: err?.message,
    timestamp: new Date().toISOString(),
  });
});

export default pool;
