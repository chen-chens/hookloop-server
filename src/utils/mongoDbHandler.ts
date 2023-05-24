import { NextFunction, Response } from "express";

import { forwardCustomError } from "@/middlewares";
import { ApiResults, StatusCode } from "@/types";
import { sendSuccessResponse } from "@/utils";

async function getDb(
  res: Response,
  next: NextFunction,
  modelName: string,
  model: any,
  query: any,
  projection: any = null,
  populate: any = null,
) {
  const target = await model
    .findOne(query, projection)
    .populate(populate)
    .catch((err: Error) => {
      console.log("MongoDb GET error: ", err);
    });
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

async function updateDb(
  res: Response,
  next: NextFunction,
  modelName: string,
  model: any,
  query: any,
  updateData: any = null,
  projection: any = null,
) {
  const updateResult = await model.updateOne(query, updateData).catch((err: Error) => {
    console.log("MongoDb UPDATE error: ", err);
  });
  if (!updateResult || !updateResult.matchedCount) {
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

export default { getDb, updateDb };
