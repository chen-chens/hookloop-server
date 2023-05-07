import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { ApiResults, ApiStatus, CustomError, IDataType, StatusCode } from "@/types";
import { sendErrorResponse } from "@/utils";

// INFO: 使用 asyncWrapper 包裹 async 函数，可以避免每個 async 函数都寫 try catch
// const asyncWrapper = (fn) => {
//   return  (req, res, nex) => {
//     try {
//       await fn(req, res, next);
//     } catch (err) {
//       next(err);
//     }
//   };
// };
export const asyncWrapper = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  console.log("asyncWrapper");
  return (req: Request, res: Response, next: NextFunction) => {
    console.log("fn");
    fn(req, res, next).catch((err: Error) => next(err));
  };
};

// INFO: 包裝成 customError 並 next(err) 送至 errorHandler
export const forwardCustomError = (
  next: NextFunction,
  statusCode: StatusCode,
  message: ApiResults,
  data: IDataType = {},
) => {
  const err = new CustomError(statusCode, message, data);
  console.log("forwardCustomError");
  next(err);
};

// INFO: Error handler middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: CustomError | any, req: Request, res: Response, _: NextFunction) => {
  console.log("errorHandler");
  if (err instanceof CustomError) {
    console.log("CustomError");
    sendErrorResponse(err, res);
  } else if (err instanceof jwt.TokenExpiredError) {
    const customError = new CustomError(StatusCode.UNAUTHORIZED, ApiResults.TOKEN_IS_EXPIRED, {}, ApiStatus.FAIL);
    sendErrorResponse(customError, res);
  } else {
    // Handle other errors
    console.log("CatchError");
    let customError: CustomError;
    if (err.code === 11000) {
      console.log("err.code === 11000");
      customError = new CustomError(StatusCode.INTERNAL_SERVER_ERROR, ApiResults.FAIL_CREATE, {}, ApiStatus.ERROR);
    } else {
      console.log("other error");
      console.error(err);
      console.error("err.name:", err.name);
      customError = new CustomError(StatusCode.INTERNAL_SERVER_ERROR, ApiResults.UNEXPECTED_ERROR, {}, ApiStatus.ERROR);
    }
    sendErrorResponse(customError, res);
  }
};
