import { NextFunction, Request, Response } from "express";

import { CustomError } from "@/classes";
import { ApiResults, ApiStatus, DataType, StatusCode } from "@/types";
import { sendErrorResponse } from "@/utils";

// DISCUSS: 使用 asyncWrapper 包裹 async 函数，可以避免每個 async 函数都寫 try catch
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
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err: Error) => next(err));
  };
};

// INFO: 包裝成 custom error 並 next(err) 送至 errorHandler
export const forwardCustomError = (
  next: NextFunction,
  statusCode: StatusCode,
  message: ApiResults,
  data: DataType = {},
) => {
  const err = new CustomError(statusCode, message, data);
  next(err);
};

// INFO: Error handler middleware
// DISCUSS:要做開發環境的response嗎? 可以查看error stack
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: CustomError | any, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof CustomError) {
    sendErrorResponse(err, res);
  } else {
    let customError: CustomError;
    if (err.code === 11000) {
      // Handle other errors
      customError = new CustomError(StatusCode.INTERNAL_SERVER_ERROR, ApiResults.FAIL_CREATE, {}, ApiStatus.ERROR);
      sendErrorResponse(customError, res);
    } else {
      customError = new CustomError(StatusCode.INTERNAL_SERVER_ERROR, ApiResults.UNEXPECTED_ERROR, {}, ApiStatus.ERROR);
      sendErrorResponse(customError, res);
    }
  }
};
