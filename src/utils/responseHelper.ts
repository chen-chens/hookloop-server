import { Response } from "express";

import { ApiResults, ApiStatus, CustomError, StatusCode } from "@/types";

import responsePattern from "./responsePattern";

interface IDataType {
  [key: string]: any;
}

// DISCUSS JASon 要 end 嗎?
export const sendSuccessResponse = (res: Response, message: ApiResults, data: IDataType = {}) => {
  console.log("sendSuccessResponse");
  res.status(StatusCode.OK).send(responsePattern(ApiStatus.SUCCESS, message, data)).end();
};

export const sendErrorResponse = (err: CustomError, res: Response) => {
  console.log("sendErrorResponse");
  res.status(err.statusCode).send(responsePattern(err.status, err.message, err.data)).end();
};
