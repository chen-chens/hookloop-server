// TODO:function(err, req, res, next) {

import { NextFunction, Request, Response } from "express";

import { CustomError } from "@/classes";
import { ApiResults, ApiStatus, CustomErrorInterface } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err: CustomErrorInterface | Error, req: Request, res: Response, _: NextFunction) => {
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
