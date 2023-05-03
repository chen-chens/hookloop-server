import { NextFunction } from "express";

import ApiResults from "../types/apiResults";
import StatusCode from "../types/statusCode";

const appError = (message: ApiResults, statusCode: StatusCode, next: NextFunction) => {
  const ERROR = new Error(message);
  // todo:costomize error
  ERROR.statusCode = statusCode;
  return next(ERROR);
};

export default appError;
