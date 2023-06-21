import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import validator from "validator";

import dbOptions from "@/config/dbOptions";
import { forwardCustomError } from "@/middlewares";
import { ResetPassword, User } from "@/models";
import { ApiResults, IDecodedToken, MailOptions, StatusCode } from "@/types";
import { generateResetPasswordEmail, getJwtToken, sendSuccessResponse, validatePassword } from "@/utils";

const login = async (req: Request, res: Response, next: NextFunction) => {
  // (1) 找到 目標 email，然後比對 password 是否正確
  const { email, password } = req.body;
  const targetUser = await User.findOne({ email }).select("+password").populate({ path: "currentPlan" }).exec();
  const comparePasswordResult = await bcrypt.compare(password, targetUser?.password || "");
  if (!targetUser) {
    forwardCustomError(next, StatusCode.UNAUTHORIZED, ApiResults.FAIL_LOG_IN, {
      error: "The User is not existing! Please Sign up first!",
    });
    return;
  }
  if (targetUser.isArchived) {
    forwardCustomError(next, StatusCode.UNAUTHORIZED, ApiResults.FAIL_LOG_IN, {
      error: ApiResults.USER_IS_ARCHIVED,
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
    user: {
      id: targetUser.id,
      email: targetUser.email,
      username: targetUser.username,
      avatar: targetUser.avatar,
      isArchived: targetUser.isArchived,
      lastActiveTime: targetUser.lastActiveTime,
      createdAt: targetUser.createdAt,
      updatedAt: targetUser.updatedAt,
      currentPlan: {
        userId: targetUser?.currentPlan?.userId || null,
        name: targetUser?.currentPlan?.name || null,
        endAt: targetUser?.currentPlan?.endAt || null,
        status: targetUser?.currentPlan?.status || null,
      },
    },
  });
};

const forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  if (!validator.isEmail(email || "")) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_TO_SEND_EMAIL, {
      field: "email",
      error: "Invalid Email!",
    });
    return;
  }

  const targetUser = await User.findOne({ email });
  if (!targetUser) {
    /* ----------- 回傳中性(混淆)內容，避免被駭客重複發信確認。（實際上 DB 是找不到該會員） ----------- */
    sendSuccessResponse(res, ApiResults.EMAIL_BEEN_SENT_ALREADY);
    return;
  }

  const hasExistingResetData = await ResetPassword.findOne({ userId: targetUser.id });
  if (hasExistingResetData) {
    sendSuccessResponse(res, ApiResults.EMAIL_BEEN_SENT_ALREADY);
    return;
  }

  // (1) 產生短期限 token，存到 DB 之後驗證用。
  // (2) 寄出通知信，包含一組由信箱、token 組成 url。
  const tempToken = jwt.sign({ userId: targetUser.id, email }, process.env.JWT_SECRET_KEY!, { expiresIn: "10m" });
  const dbClearResetTokenTime = new Date(Date.now() + 10 * 60 * 1000); // token 設定 10分鐘過期，DB 自動移除資料
  const url = process.env.NODE_ENV === "production" ? process.env.FRONT_REMOTE_URL : process.env.FRONT_LOCAL_URL;
  const resetPasswordUrl = `${url}/resetPassword?resetToken=${tempToken}`;

  const { OAuth2 } = google.auth;
  const oauth2Client = new OAuth2(
    process.env.GOOGLE_AUTH_CLIENT_ID,
    process.env.GOOGLE_AUTH_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL, // YOUR_REDIRECT_URL
  );

  // To get access token by using credential oauth2Client
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_AUTH_REFRESH_TOKEN,
  });
  // temperary token
  const accessToken = await oauth2Client.getAccessToken();
  if (!accessToken) {
    forwardCustomError(next, StatusCode.INTERNAL_SERVER_ERROR, ApiResults.UNEXPECTED_ERROR);
    return;
  }

  // build nodemailer transport
  const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GOOGLE_AUTH_EMAIL,
      clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_AUTH_REFRESH_TOKEN,
      accessToken: accessToken.token || "",
    },
  });

  // nodemailer content
  const mailConfig: MailOptions = {
    from: `HOOKLOOP <${process.env.GOOGLE_AUTH_EMAIL!}>`,
    to: email,
    subject: "HOOKLOOP Reset Password",
    html: generateResetPasswordEmail(targetUser.username, resetPasswordUrl),
  };

  // send Email
  const sendResult = await mailTransporter.sendMail(mailConfig);
  console.log("🚀 ~ ------ forgetPassword ~ sendResult:", sendResult);

  mailTransporter.sendMail(mailConfig, (err: Error | null, info: SMTPTransport.SentMessageInfo) => {
    if (err) {
      console.log(err);
      return forwardCustomError(next, StatusCode.Service_Unavailable, ApiResults.FAIL_TO_SEND_EMAIL, {
        field: "",
        error: ApiResults.UNEXPECTED_ERROR,
      });
    }

    return sendSuccessResponse(res, ApiResults.SEND_RESET_PASSWORD_EMAIL, {
      title: ApiResults.SEND_RESET_PASSWORD_EMAIL,
      description: `An email has been sent to your email address: ${info.accepted[0]}.`,
    });
  });

  await ResetPassword.create({
    userId: targetUser.id,
    tempToken,
    expiresAt: dbClearResetTokenTime,
  });
};

const validateResetPasswordToken = async (req: Request, res: Response, next: NextFunction) => {
  const { resetToken } = req.params;

  const decode = await jwt.verify(resetToken, process.env.JWT_SECRET_KEY!);
  if (!decode) {
    return forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.CANT_RESET_PASSWORD);
  }
  const { userId } = decode as IDecodedToken;
  const targetUser = await ResetPassword.findOne({ userId });
  if (!targetUser) {
    return forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.CANT_RESET_PASSWORD);
  }

  if (resetToken !== targetUser.tempToken) {
    return forwardCustomError(next, StatusCode.UNAUTHORIZED, ApiResults.CANT_RESET_PASSWORD);
  }

  return sendSuccessResponse(res, ApiResults.VERIFIED_TOKEN);
};

const verifyResetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { newPassword, resetPasswordToken } = req.body;
  if (!validatePassword(newPassword || "")) {
    return forwardCustomError(next, StatusCode.UNAUTHORIZED, ApiResults.TOKEN_IS_EXPIRED, {});
  }

  const decode = await jwt.verify(resetPasswordToken, process.env.JWT_SECRET_KEY!);
  if (!decode) {
    return forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.CANT_RESET_PASSWORD);
  }
  const { userId } = decode as IDecodedToken;
  const targetUser = await ResetPassword.findOne({ userId });
  if (!targetUser) {
    return forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.CANT_RESET_PASSWORD);
  }

  if (resetPasswordToken !== targetUser.tempToken) {
    return forwardCustomError(next, StatusCode.UNAUTHORIZED, ApiResults.CANT_RESET_PASSWORD);
  }

  const securedPassword = await bcrypt.hash(newPassword, 12);
  const newData = await User.findByIdAndUpdate(userId, { password: securedPassword }, dbOptions);
  const newToken = await getJwtToken(userId);

  return sendSuccessResponse(res, ApiResults.SUCCESS_LOG_IN, {
    token: newToken,
    user: {
      id: newData?.id,
      email: newData?.email,
      username: newData?.username,
      avatar: newData?.avatar,
      isArchived: newData?.isArchived,
      lastActiveTime: newData?.lastActiveTime,
      createdAt: newData?.createdAt,
      updatedAt: newData?.updatedAt,
    },
  });
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
  const targetUser = await User.findById(userId).populate({ path: "currentPlan" }).exec();
  if (!targetUser) {
    forwardCustomError(next, StatusCode.NOT_FOUND, ApiResults.FAIL_READ);
    return;
  }
  sendSuccessResponse(res, ApiResults.VERIFIED_TOKEN, {
    id: targetUser.id,
    email: targetUser.email,
    username: targetUser.username,
    avatar: targetUser.avatar,
    isArchived: targetUser.isArchived,
    lastActiveTime: targetUser.lastActiveTime,
    createdAt: targetUser.createdAt,
    updatedAt: targetUser.updatedAt,
    currentPlan: {
      userId: targetUser?.currentPlan?.userId || null,
      name: targetUser?.currentPlan?.name || null,
      endAt: targetUser?.currentPlan?.endAt || null,
      status: targetUser?.currentPlan?.status || null,
    },
  });
};

export default {
  login,
  forgetPassword,
  verifyResetPassword,
  validateResetPasswordToken,
  verifyEmail,
  verifyUserToken,
};
