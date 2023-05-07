import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";

import { forwardCustomError } from "@/middlewares";
import { User } from "@/models";
import { ApiResults, StatusCode } from "@/types";
import { getJwtToken, sendSuccessResponse } from "@/utils";

const login = async (req: Request, res: Response, next: NextFunction) => {
  // (1) 找到 目標 email，然後比對 password 是否正確
  // (2) send token: 後端 塞 cookie
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
  res.cookie("hookloop-token", token, {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    httpOnly: true,
    secure: true,
  });
  sendSuccessResponse(res, ApiResults.SUCCESS_LOG_IN, {
    token,
    name: targetUser.name,
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

const verifyEmail = async (req: Request, res: Response) => {
  console.log(req, res);
};

export default {
  login,
  forgetPassword,
  verifyPassword,
  verifyEmail,
};
