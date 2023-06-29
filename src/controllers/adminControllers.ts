import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { forwardCustomError } from "@/middlewares";
import { AdminUser, User } from "@/models";
import Plan from "@/models/planModel";
import { ApiResults, IDecodedToken, StatusCode } from "@/types";
import IPlansRequest from "@/types/plansRequest";
import { filteredUndefinedConditions, getJwtToken, sendSuccessResponse, timeHandler } from "@/utils";
import mongoDbHandler from "@/utils/mongoDbHandler";

const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, startDate, endDate, isArchived, planType } = req.body;
  const queryConditions = filteredUndefinedConditions({ username, email, isArchived });

  // // 如果沒有任何條件，就回傳空陣列
  // if (Object.keys(req.body).length === 0) {
  //   sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, { users: [] });
  //   return;
  // }

  // 搜尋註冊時間區間
  if (startDate && endDate) {
    const { isValidDateTime } = timeHandler;

    if (!isValidDateTime(startDate) || !isValidDateTime(endDate)) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_TO_GET_DATA, {
        error: "Invalid date format.",
      });
      return;
    }

    queryConditions.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  // 模糊搜尋
  const regexConditions: { [key: string]: any } = {};
  if (username) {
    regexConditions.username = { $regex: new RegExp(username, "i") };
  }
  if (email) {
    regexConditions.email = { $regex: new RegExp(email, "i") };
  }

  const targetUsers = await User.find({
    ...queryConditions,
    ...regexConditions,
  })
    .populate({ path: "currentPlan" })
    .exec();

  if (!targetUsers) {
    // 回傳空陣列，代表沒有符合此條件下的 user
    sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, { users: [] });
  } else if (Object.keys(req.body).length === 0) {
    const data = targetUsers.map((targetUser) => ({
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
    }));
    sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, data);
  } else {
    // 過濾符合條件的使用者
    const usersWithTargetPlan = targetUsers.filter((user) => user.currentPlan?.name === planType);
    const data = usersWithTargetPlan.map((targetUser) => ({
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
    }));
    sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, data);
  }
};

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  // 前端點擊 user 的時候，將 user id 帶入 url query
  const { id } = req.params;
  const targetUser = await User.findOne({ _id: id });

  if (!targetUser) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_TO_GET_DATA, {
      field: "user",
      error: "User Id not found.",
    });
  } else {
    sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, {
      user: targetUser,
    });
  }
};

const updateUserById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const { username, plan, isArchived } = req.body;
  const targetUser = await User.findById(id);

  if (!targetUser) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_TO_GET_DATA, {
      field: "user",
      error: "User Id not found.",
    });
  } else {
    const updateData = { username, plan, isArchived };
    mongoDbHandler.updateDb(res, next, "User", User, { _id: id }, updateData, {});
  }
};

// 可使用 postman 建立帳號，不會有前端註冊帳號畫面
const register = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  // 檢查參數不為空
  if (!username || !password) {
    let errorColumn = "";
    if (!username && !password) {
      errorColumn = "username and password";
    } else if (!username) {
      errorColumn = "username";
    } else if (!password) {
      errorColumn = "password";
    }

    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
      field: errorColumn,
      error: `Please enter ${errorColumn}`,
    });
  }

  // 後臺註冊只需要 username 和 password，所以只要 username 無重複即可
  const hasExistingUsername = await AdminUser.findOne({ username });
  if (hasExistingUsername) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
      field: "username",
      error: "The username is existing!",
    });
  }

  const securedPassword = await bcrypt.hash(password, 12);
  const newUser = await AdminUser.create({
    username,
    password: securedPassword,
    lastActiveTime: Date.now(),
  });
  const token = getJwtToken(newUser.id!);
  sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, {
    token,
    username: newUser.username,
  });
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  // 只做簡單的不為空檢查
  if (!username || !password) {
    let errorColumn = "";
    if (!username && !password) {
      errorColumn = "username and password";
    } else if (!username) {
      errorColumn = "username";
    } else if (!password) {
      errorColumn = "password";
    }

    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_LOG_IN, {
      field: errorColumn,
      error: `Please enter ${errorColumn}`,
    });
  }

  const targetUser = await AdminUser.findOne({ username }).select("+password");
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
      username: targetUser.username,
      createdAt: targetUser.createdAt,
      updatedAt: targetUser.updatedAt,
    },
  });
};

const getPlansByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const tradeRecords = await Plan.find({ userId }).populate("user").exec();
  const { user } = tradeRecords[0];
  sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, {
    plans: tradeRecords,
    user: {
      username: user?.username,
      email: user?.email,
    },
  });
};

const getPlans = async (req: IPlansRequest, res: Response) => {
  const { userId, planType, payTime, status, merchantOrderNo } = req.body;
  const queryConditions = filteredUndefinedConditions({ userId, name: planType, payTime, status, merchantOrderNo });

  // 模糊搜尋
  const regexConditions: { [key: string]: any } = {};
  if (merchantOrderNo) {
    regexConditions.merchantOrderNo = { $regex: new RegExp(merchantOrderNo, "i") };
  }

  // 搜尋PayTime
  // if (payTime) {
  //   const { isValidDateTime } = timeHandler;

  //   if (!isValidDateTime(payTime)) {
  //     forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_TO_GET_DATA, {
  //       error: "Invalid date format.",
  //     });
  //     return;
  //   }

  //   // 取得 payTime 當日的起始時間
  //   const startDate = new Date(payTime);
  //   startDate.setHours(0, 0, 0, 0);

  //   // 取得 payTime 當日的最後一毫秒
  //   const endDate = new Date(payTime);
  //   endDate.setHours(23, 59, 59, 999);

  //   queryConditions.payTime = {
  //     $gte: startDate,
  //     $lte: endDate,
  //   };
  // }

  const tradeRecords = await Plan.find({ ...queryConditions, ...regexConditions })
    .populate({
      path: "userId",
      select: "username email",
    })
    .exec();

  const { user } = tradeRecords[0];
  sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, {
    plans: tradeRecords,
    user: {
      username: user?.username,
      email: user?.email,
    },
  });
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
  const targetUser = await AdminUser.findById(userId);
  if (!targetUser) {
    forwardCustomError(next, StatusCode.NOT_FOUND, ApiResults.FAIL_READ);
    return;
  }
  sendSuccessResponse(res, ApiResults.VERIFIED_TOKEN, targetUser);
};
export default {
  getUsers,
  getUserById,
  updateUserById,
  register,
  login,
  getPlansByUserId,
  verifyUserToken,
  getPlans,
};
