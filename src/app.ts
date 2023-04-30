import dotenv from "dotenv";
import express, { NextFunction, Response } from "express";
import path from "path";

import router from "./routes";

dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();
app.use((_, res: Response, next: NextFunction) => {
  const headers = {
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, POST, PATCH, DELETE, OPTIONS",
    "Content-Type": "application/json",
  };
  res.header(headers);
  next();
});
app.use(express.json());
app.use(router); // Set router

export default app;
