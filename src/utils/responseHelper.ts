import { Response } from "express";

import { ApiResults, ApiStatus, CustomError, IDataType, StatusCode } from "@/types";

import responsePattern from "./responsePattern";

export const sendSuccessResponse = (res: Response, message: ApiResults, data: IDataType = {}) => {
  console.log("sendSuccessResponse");
  res.status(StatusCode.OK).send(responsePattern(ApiStatus.SUCCESS, message, data));
};

export const sendErrorResponse = (err: CustomError, res: Response) => {
  console.log("sendErrorResponse");
  res.status(err.statusCode).send(responsePattern(err.status, err.message, err.data));
};
