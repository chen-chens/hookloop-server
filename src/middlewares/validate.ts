import { NextFunction, Request, Response } from "express";

import { ApiResults, StatusCode, ValidationFn } from "@/types";

import { forwardCustomError } from "./errorMiddleware";

const validate = (validationFn: ValidationFn) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationError = validationFn(req);
    if (validationError) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, validationError);
    } else {
      next();
    }
  };
};

export default validate;
