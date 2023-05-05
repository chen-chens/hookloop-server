import { Response } from "express";

import { CustomError } from "@/classes";
import { ApiResults, ApiStatus, StatusCode } from "@/types";

import responsePattern from "./responsePattern";

interface DataType {
  [key: string]: any;
}

export const sendSuccessResponse = (res: Response, message: ApiResults, data: DataType = {}) => {
  res.status(StatusCode.OK).send(responsePattern(ApiStatus.SUCCESS, message, data)).end();
};

export const sendErrorResponse = (err: CustomError, res: Response) => {
  res.status(err.statusCode).send(responsePattern(err.status, err.message, err.data)).end();
};