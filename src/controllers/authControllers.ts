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
  const targetUser = await User.findOne({ email }).select("+password");
  const comparePasswordResult = await bcrypt.compare(password, targetUser?.password || "");
  if (!targetUser) {
    forwardCustomError(next, StatusCode.UNAUTHORIZED, ApiResults.FAIL_LOG_IN, {
      error: "The User is not existing! Please Sign up first!",
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
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_TO_SEND_EMAIL, {
      field: "",
      error: "The member is not existing! ",
    });
    return;
  }

  const hasExistingResetData = await ResetPassword.findOne({ userId: targetUser.id });
  if (hasExistingResetData) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.EMAIL_BEEN_SENT_ALREADY, {
      field: "",
      error: "The reset password Email has been sent! Please check out your email!",
    });
    return;
  }

  // (1) 產生短期限 token，存到 DB 之後驗證用。
  // (2) 寄出通知信，包含一組由信箱、token 組成 url。
  const tempToken = jwt.sign({ userId: targetUser.id, email }, process.env.JWT_SECRET_KEY!, { expiresIn: "10m" });
  const dbClearResetTokenTime = new Date(Date.now() + 10 * 60 * 1000); // token 設定 10分鐘過期，DB 自動移除資料
  const url = process.env.NODE_ENV === "production" ? "https://hookloop-client.onrender.com" : "http://localhost:3000";
  const resetPasswordUrl = `${url}/resetPassword?resetToken=${tempToken}`;

  await ResetPassword.create({
    userId: targetUser.id,
    tempToken,
    expiresAt: dbClearResetTokenTime,
  });

  const { OAuth2 } = google.auth;
  const oauth2Client = new OAuth2(
    process.env.GOOGLE_AUTH_CLIENT_ID,
    process.env.GOOGLE_AUTH_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground", // YOUR_REDIRECT_URL
  );

  // To get access token by using credential oauth2Client
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_AUTH_REFRESH_TOKEN,
  });
  // temperary token
  oauth2Client
    .getAccessToken()
    .then((value) => {
      if (value.token) {
        // build nodemailer transport
        const mailTransporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: process.env.GOOGLE_AUTH_EMAIL,
            clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
            clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_AUTH_REFRESH_TOKEN,
            accessToken: value.token || "",
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
      }
    })
    .catch((reason: any) => {
      console.log("🚀 ~ file: authControllers.ts:87 ~ .then ~ reason:", reason);
      return forwardCustomError(next, StatusCode.INTERNAL_SERVER_ERROR, ApiResults.UNEXPECTED_ERROR);
    });
};

const verifyResetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { newPassword, resetPasswordToken } = req.body;
  if (!validatePassword(newPassword || "")) {
    return forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
      field: "password",
      error: "Invalid Password! Password must be 8-20 characters and contain only letters and numbers.",
    });
  }

  const decode = await jwt.verify(resetPasswordToken, process.env.JWT_SECRET_KEY!);
  const { userId } = decode as IDecodedToken;
  const targetUser = await ResetPassword.findOne({ userId });
  if (!targetUser) {
    return forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
      field: "",
      error: "The member is not existing! ",
    });
  }

  if (resetPasswordToken !== targetUser.tempToken) {
    return forwardCustomError(next, StatusCode.UNAUTHORIZED, ApiResults.FAIL_UPDATE, {
      field: "",
      error: "You don't have authorization to reset password! ",
    });
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
  verifyResetPassword,
  verifyEmail,
  verifyUserToken,
};
