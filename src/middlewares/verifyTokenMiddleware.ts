import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { User } from "@/models";
import { IUser } from "@/models/userModel";
import { ApiResults, IDecodedToken, StatusCode } from "@/types";

import { asyncWrapper, forwardCustomError } from "./errorMiddleware";

declare module "express" {
  interface Request {
    user?: IUser;
    body: any;
  }
}
const verifyTokenMiddleware = async (req: Request, _: Response, next: NextFunction) => {
  // (1) 從 header 中拿 token
  // (2) 驗證 token 有沒有過期
  const bearerToken = req.headers.authorization;
  const token = bearerToken?.split(" ")[1];
  if (!token) {
    return forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.TOKEN_IS_NULL);
  }
  const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY!);
  const { userId } = decode as IDecodedToken;
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    return forwardCustomError(next, StatusCode.NOT_FOUND, ApiResults.FAIL_READ);
  }
  req.user = targetUser;

  return next();
};

export default asyncWrapper(verifyTokenMiddleware);
