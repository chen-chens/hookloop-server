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
// export interface RequestWrapper extends Request {
//   [key: string]: any;
// }
export const asyncWrapper = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
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
  console.log("🚀 ~ file: errorMiddleware.ts:43 ~ errorHandler ~ err:", err, !!(err instanceof jwt.TokenExpiredError));
  console.log("errorHandler");
  console.log("==============err=================\n", err, "\n==============end=================");
  if (err instanceof CustomError) {
    console.log("CustomError");
    sendErrorResponse(err, res);
  } else if (err instanceof jwt.TokenExpiredError) {
    const customError = new CustomError(StatusCode.UNAUTHORIZED, ApiResults.TOKEN_IS_EXPIRED, {}, ApiStatus.FAIL);
    sendErrorResponse(customError, res);
  } else {
    // Handle other errors
    console.log("CatchError");
    let customError: CustomError = new CustomError(
      StatusCode.INTERNAL_SERVER_ERROR,
      ApiResults.UNEXPECTED_ERROR,
      {},
      ApiStatus.ERROR,
    );
    if (err.code === 11000) {
      console.log("err.code === 11000");
      customError = new CustomError(StatusCode.INTERNAL_SERVER_ERROR, ApiResults.FAIL_CREATE, {}, ApiStatus.ERROR);
    } else if (err.name === "TypeError") {
      console.log("Validator type error");
      customError = new CustomError(StatusCode.BAD_REQUEST, ApiResults.VALIDATOR_TYPE_ERROR, {}, ApiStatus.ERROR);
    } else if (err.name === "MulterError") {
      console.log("MulterError");
      if (err.code === "LIMIT_FILE_SIZE" && err.field === "file") {
        customError = new CustomError(StatusCode.BAD_REQUEST, ApiResults.FAIL_UPLOAD_FILE_SIZE, {}, ApiStatus.ERROR);
      } else if (err.code === "LIMIT_FILE_SIZE" && err.field === "avatarImage") {
        customError = new CustomError(StatusCode.BAD_REQUEST, ApiResults.FAIL_UPLOAD_IMAGE_SIZE, {}, ApiStatus.ERROR);
      }
    } else {
      console.log("other error");
      console.error("err.name:", err.name);
    }
    sendErrorResponse(customError, res);
  }
};
