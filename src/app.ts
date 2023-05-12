import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import corsOptions from "./config/corsOptions";
import { errorHandler } from "./middlewares";
import router from "./routes";
import { ApiResults, ApiStatus, StatusCode } from "./types";

dotenv.config();

const app = express();

// 设置允许的前端域名，可以是多个域名
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://hookloop-client.onrender.com");
  next();
});

// 允许携带凭证
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(cors(corsOptions)); // Set CORS with default options
app.use(express.json());
app.use(cookieParser());

app.use(router); // Set router

// INFO: 404 error and  errorHandler middleware
app.use((_, res) => {
  console.log("404");
  res.status(StatusCode.NOT_FOUND).json({
    status: ApiStatus.FAIL,
    message: ApiResults.NOT_FOUND,
  });
});

app.use(errorHandler);

export default app;
