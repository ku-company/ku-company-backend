import express from "express";
import mockRouter  from "./router/mockRoutes.js";
import cors from "cors";
import type { Express , Request, Response }  from "express";


const port = 8000;
const app: Express = express();

app.use(cors());
app.use(express.json());

app.use("/api/mock", mockRouter);


app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

