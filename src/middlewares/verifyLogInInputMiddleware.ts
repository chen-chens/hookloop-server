import { NextFunction, Request, Response } from "express";
import validator from "validator";

import { ApiLogInResults } from "../types/apiResults";
import ApiStatus from "../types/apiStatus";
import StatusCode from "../types/statusCode";
import responsePattern from "../utils/responsePattern";
import validatePassword from "../utils/validatePassword";

const verifyLogInInputMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  /**
   * 針對使用者 input 做檢查，但不包含：DB相關 或 加密相關
   * (1) 確認 req.body 所有必填項目是否有值: email, password
   * (2) 確認 email, password 是否符合限制
   */
  const { email, password } = req.body;

  if (!validatePassword(password || "")) {
    res.status(StatusCode.BAD_REQUEST).send(
      responsePattern(ApiStatus.FAIL, ApiLogInResults.FAIL_LOG_IN, {
        field: "password",
        error: "Invalid Password! Password must be 8-20 characters and contain only letters and numbers.",
      }),
    );
    res.end();
    return;
  }
  if (!validator.isEmail(email || "")) {
    res.status(StatusCode.BAD_REQUEST).send(
      responsePattern(ApiStatus.FAIL, ApiLogInResults.FAIL_LOG_IN, {
        field: "email",
        error: "Invalid Email!",
      }),
    );
    res.end();
    return;
  }

  next();
};

export default verifyLogInInputMiddleware;