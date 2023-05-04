// TODO:function(err, req, res, next) {

import { NextFunction, Request, Response } from "express";

import ApiResults from "../types/apiResults";
import ApiStatus from "../types/apiStatus";
import CustomError from "../types/classes/customError";
import ICustomError from "../types/customError";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err: ICustomError | Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof CustomError) {
    // Handle custom errors
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Handle other errors
    res.status(500).json({
      status: ApiStatus.ERROR,
      message: ApiResults.UNEXPECTED_ERROR,
    });
  }
};

export default errorHandler;
