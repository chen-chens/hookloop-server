import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";

import errorHandler from "./middlewares/errorHandler";
import router from "./routes";

dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();

// Set CORS with default options
app.use(cors());
app.use(express.json());

app.use(router); // Set router

// DISCUSS: 註冊 errorHandler middleware
app.use(errorHandler);
export default app;
