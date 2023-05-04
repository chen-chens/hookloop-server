import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";

import errorHandler from "./middlewares/errorHandler";
import router from "./routes";
import ApiResults from "./types/apiResults";
import ApiStatus from "./types/apiStatus";
import StatusCode from "./types/statusCode";

dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();

// Set CORS with default options
app.use(cors());
app.use(express.json());

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
