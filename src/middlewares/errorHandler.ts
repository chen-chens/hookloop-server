// TODO:function(err, req, res, next) {

import { NextFunction, Request, Response } from "express";

import CustomError from "../types/classes/customError";
import ICustomError from "../types/customError";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err: ICustomError | Error, req: Request, res: Response, _next: NextFunction) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  if (err instanceof CustomError) {
    // Handle custom errors
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  } else {
    // Handle other errors
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

export default errorHandler;
