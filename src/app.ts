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

app.use(cors(corsOptions)); // Set CORS with default options
app.use(express.json());
app.use(cookieParser());

// DISCUSS: 註冊 router 希望改成 app.use('/api',router);
app.use(router); // Set router

// DISCUSS: 註冊 errorHandler middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((_req, res, _next) => {
  res.status(StatusCode.NOT_FOUND).json({
    status: ApiStatus.FAIL,
    message: ApiResults.NOT_FOUND,
  });
});

app.use(errorHandler);

export default app;
