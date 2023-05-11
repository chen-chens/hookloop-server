import { NextFunction, Response } from "express";

import { forwardCustomError } from "@/middlewares";
import { ApiResults, StatusCode } from "@/types";
import { sendSuccessResponse } from "@/utils";

async function getDbById(
  modelName: string,
  model: any,
  query: any,
  projection: any,
  res: Response,
  next: NextFunction,
) {
  const target = await model.findOne(query, projection);
  if (!target) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_READ, {
      error: `${modelName} not found.`,
    });
  } else {
    sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, {
      target,
    });
  }
}

async function updateDbById(
  modelName: string,
  model: any,
  query: any,
  updateData: any,
  projection: any,
  res: Response,
  next: NextFunction,
) {
  const updateResult = await model.updateOne(query, updateData);
  if (!updateResult.matchedCount) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
      error: `${modelName} not found.`,
    });
  } else {
    const target = await model.findOne(query, projection);
    if (!target) {
      forwardCustomError(next, StatusCode.INTERNAL_SERVER_ERROR, ApiResults.UNEXPECTED_ERROR);
    } else {
      sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, {
        target,
      });
    }
  }
}

export { getDbById, updateDbById };
