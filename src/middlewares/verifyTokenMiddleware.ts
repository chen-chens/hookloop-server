import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import HOOKLOOP_TOKEN from "@/config/const";
import { User } from "@/models";
import { ApiResults, IDecodedToken, StatusCode } from "@/types";

import { asyncWrapper, forwardCustomError } from "./errorMiddleware";

const verifyTokenMiddleware = async (req: Request, _: Response, next: NextFunction) => {
  // (1) 從 cookie 中拿 token
  // (2) 驗證 token 有沒有過期
  const token = req.cookies[HOOKLOOP_TOKEN];
  if (!token) {
    return forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.TOKEN_IS_NULL);
  }

  const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY!);
  const { userId } = decode as IDecodedToken;
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    return forwardCustomError(next, StatusCode.NOT_FOUND, ApiResults.FAIL_READ);
  }
  req.body.user = targetUser;

  return next();
};

export default asyncWrapper(verifyTokenMiddleware);
