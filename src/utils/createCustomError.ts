import { NextFunction } from "express";

import { CustomError } from "@/classes";
import { ApiResults, StatusCode } from "@/types";

// DISCUSS: 包裝成 custom error 並 next(err)
const createCustomError = (statusCode: StatusCode, message: ApiResults, next: NextFunction) => {
  const err = new CustomError(statusCode, message);
  next(err);
};

export default createCustomError;
