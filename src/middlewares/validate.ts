import { NextFunction, Request, Response } from "express";

import { ApiResults, StatusCode, ValidationFn } from "@/types";

import { forwardCustomError } from "./errorMiddleware";

const validate = (validationFn: ValidationFn, apiMethod: string) => {
  let apiResults: ApiResults;
  switch (apiMethod) {
    case "CREATE":
      apiResults = ApiResults.FAIL_CREATE;
      break;
    case "READ":
      apiResults = ApiResults.FAIL_TO_GET_DATA;
      break;
    case "UPDATE":
      apiResults = ApiResults.FAIL_UPDATE;
      break;
    case "DELETE":
      apiResults = ApiResults.FAIL_DELETE;
      break;
    case "UPLOAD":
      apiResults = ApiResults.FAIL_UPLOAD;
      break;
    default:
      apiResults = ApiResults.UNEXPECTED_ERROR;
      break;
  }
  return (req: Request, res: Response, next: NextFunction) => {
    const validationError = validationFn(req);
    if (validationError) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, apiResults, validationError);
    } else {
      next();
    }
  };
};

export default validate;
