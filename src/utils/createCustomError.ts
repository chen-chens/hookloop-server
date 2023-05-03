import { NextFunction } from "express";

import ApiResults from "../types/apiResults";
import CustomError from "../types/classes/customError";
import StatusCode from "../types/statusCode";
// DISCUSS: 包裝成 custom error 並 next(err)
const createCustomError = (statusCode: StatusCode, message: ApiResults, next: NextFunction) => {
  const err = new CustomError(statusCode, message);
  next(err);
};

export default createCustomError;
