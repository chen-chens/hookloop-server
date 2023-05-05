import bcrypt from "bcryptjs";
import { Request, Response } from "express";

import { User } from "@/models";
import { ApiLogInResults, ApiStatus, StatusCode } from "@/types";
import { getJwtToken, responsePattern } from "@/utils";

// DISCUSS:res.的 prettier 設定不同
const login = async (req: Request, res: Response) => {
  // (1) 找到 目標 email，然後比對 password 是否正確
  // (2) send token: 後端 塞 cookie ?
  try {
    const { email, password } = req.body;
    const targetUser = await User.findOne({ email }).select("+password");
    const comparePasswordResult = await bcrypt.compare(password, targetUser?.password || "");
    if (!targetUser) {
      res.status(StatusCode.UNAUTHORIZED).send(
        responsePattern(ApiStatus.FAIL, ApiLogInResults.FAIL_LOG_IN, {
          error: ApiLogInResults.UNAUTHORIZED_IDENTITY,
        }),
      );
      res.end();
      return;
    }
    if (!comparePasswordResult) {
      res.status(StatusCode.UNAUTHORIZED).send(
        responsePattern(ApiStatus.FAIL, ApiLogInResults.FAIL_LOG_IN, {
          field: "password",
          error: ApiLogInResults.MIS_MATCH_PASSWORD,
        }),
      );
      res.end();
      return;
    }
    const token = getJwtToken(targetUser.id);
    res
      .cookie("hookloop-token", token, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        httpOnly: true,
        secure: true,
      })
      .status(StatusCode.OK)
      .send(
        responsePattern(ApiStatus.SUCCESS, ApiLogInResults.SUCCESS_LOG_IN, {
          token,
          name: targetUser.name,
        }),
      );
    res.end();
  } catch (error) {
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .send(responsePattern(ApiStatus.ERROR, ApiLogInResults.FAIL_LOG_IN, { error }));
    res.end();
  }
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
