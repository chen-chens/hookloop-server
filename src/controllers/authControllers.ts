import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { forwardCustomError } from "@/middlewares";
import { User } from "@/models";
import { ApiResults, IDecodedToken, StatusCode } from "@/types";
import { getJwtToken, sendSuccessResponse } from "@/utils";

const login = async (req: Request, res: Response, next: NextFunction) => {
  // (1) 找到 目標 email，然後比對 password 是否正確
  const { email, password } = req.body;
  const targetUser = await User.findOne({ email }).select("+password");
  const comparePasswordResult = await bcrypt.compare(password, targetUser?.password || "");
  if (!targetUser) {
    forwardCustomError(next, StatusCode.UNAUTHORIZED, ApiResults.FAIL_LOG_IN, {
      error: ApiResults.UNAUTHORIZED_IDENTITY,
    });
    return;
  }
  if (!comparePasswordResult) {
    forwardCustomError(next, StatusCode.UNAUTHORIZED, ApiResults.FAIL_LOG_IN, {
      field: "password",
      error: ApiResults.MIS_MATCH_PASSWORD,
    });
    return;
  }
  const token = getJwtToken(targetUser.id);
  sendSuccessResponse(res, ApiResults.SUCCESS_LOG_IN, {
    token,
    user: targetUser,
  });
};

const forgetPassword = async (req: Request, res: Response) => {
  console.log(req, res);
  // (1) 寄出通知信，信內容包含驗證碼
  // (2) 原網址 email input 改成輸入驗證嗎，並加入失效時間
};

const verifyPassword = async (req: Request, res: Response) => {
  console.log(req, res);
  // 驗證：使用者輸入的驗證碼？ 這裡的 Password 是 驗證碼 嗎？(是)
};

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  const hasExistingEmail = await User.findOne({ email });

  if (hasExistingEmail) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.EMAIL_BEEN_USED);
  } else {
    sendSuccessResponse(res, ApiResults.EMAIL_NOT_BEEN_USED, { email });
  }
};

const verifyUserToken = async (req: Request, res: Response, next: NextFunction) => {
  // (1) 從 header 中拿 token
  // (2) 驗證 token 有沒有過期
  const bearerToken = req.headers.authorization;
  const token = bearerToken?.split(" ")[1];
  if (!token) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.TOKEN_IS_NULL);
    return;
  }
  const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY!);
  const { userId } = decode as IDecodedToken;
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    forwardCustomError(next, StatusCode.NOT_FOUND, ApiResults.FAIL_READ);
    return;
  }
  sendSuccessResponse(res, ApiResults.VERIFIED_TOKEN, targetUser);
};

export default {
  login,
  forgetPassword,
  verifyPassword,
  verifyEmail,
  verifyUserToken,
};
