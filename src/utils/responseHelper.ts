import { Response } from "express";

import { ApiResults, ApiStatus, CustomError, IDataType, StatusCode, ValErrorData } from "@/types";

import responsePattern from "./responsePattern";

export const sendSuccessResponse = (res: Response, message: ApiResults, data: IDataType = {}) => {
  console.log("sendSuccessResponse");
  res.status(StatusCode.OK).json(responsePattern(ApiStatus.SUCCESS, message, data));
};

export const sendErrorResponse = (err: CustomError, res: Response) => {
  console.log("sendErrorResponse");
  res.status(err.statusCode).json(responsePattern(err.status, err.message, err.data));
};

export const generateErrorData = (field: string, error: string): ValErrorData => {
  return { field, error };
};
