import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import validator from "validator";

import dbOptions from "@/config/dbOptions";
import { forwardCustomError } from "@/middlewares";
import { User } from "@/models";
import { ApiResults, IDecodedToken, StatusCode } from "@/types";
import { getJwtToken, sendSuccessResponse, validatePassword } from "@/utils";
import sendEmail, { MailOptions } from "@/utils/sendEmail";

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

  // (1) 產生短期限 token，存到 DB 之後驗證用。
  // (2) 寄出通知信，包含一組由信箱、token 組成 url。
  const tempToken = jwt.sign({ userId: targetUser.id }, process.env.JWT_SECRET_KEY!, { expiresIn: "10m" });
  const dbClearResetTokenTime = new Date(Date.now() + (10 * 60 + 30) * 1000); // token 設定 10分鐘過期，DB 自動在 10分鐘又30秒 移除 resetToken
  const url = process.env.NODE_ENV === "production" ? "https://hookloop-client.onrender.com" : "http://localhost:3000";
  const resetPasswordUrl = `${url}/resetPassword/${tempToken}`;

  targetUser.resetToken = {
    token: tempToken,
    expiresAt: dbClearResetTokenTime,
  };
  await targetUser.save();

  // nodemailer
  const mailConfig: MailOptions = {
    from: process.env.SMTP_SEND_EMAIL!,
    to: email,
    subject: "HOOKLOOP Reset Password",
    html: `
      Hi ${targetUser.username}, 
      <p>A request has been received to change the password for your HOOKLOOP account. Please reset your password in 10 minutes.</p>
      <a href=${resetPasswordUrl} target="_blank">Reset Password</a>

      <footer>HOOKLOOP</footer>
    `,
  };

  await sendEmail(mailConfig);

  sendSuccessResponse(res, ApiResults.SEND_RESET_PASSWORD_EMAIL, {
    title: ApiResults.SEND_RESET_PASSWORD_EMAIL,
    description: `
      An email has been sent to your email address: ${email}. 
      Follow the directions in the email to reset your password.
      Note: The email reset authorization is available for 10 minutes.
    `,
  });
};

const verifyPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { newPassword, resetPasswordToken } = req.body;
  if (!validatePassword(newPassword || "")) {
    return forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
      field: "password",
      error: "Invalid Password! Password must be 8-20 characters and contain only letters and numbers.",
    });
  }

  const decode = await jwt.verify(resetPasswordToken, process.env.JWT_SECRET_KEY!);
  const { userId } = decode as IDecodedToken;
  const targetUser = await User.findOne({ id: userId });
  if (!targetUser) {
    return forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_TO_SEND_EMAIL, {
      field: "",
      error: "The member is not existing! ",
    });
  }

  if (resetPasswordToken !== targetUser.resetToken?.token) {
    return forwardCustomError(next, StatusCode.UNAUTHORIZED, ApiResults.FAIL_TO_SEND_EMAIL, {
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
  verifyPassword,
  verifyEmail,
  verifyUserToken,
};
