import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";

import router from "./routes";

dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();

// Set CORS with default options
app.use(cors());
app.use(express.json());
app.use(router); // Set router\

export default app;
