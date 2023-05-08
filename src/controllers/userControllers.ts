import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";

import { forwardCustomError } from "@/middlewares";
import { User, Workspace } from "@/models";
import { ApiResults, StatusCode } from "@/types";
import { getJwtToken, getUserIdByToken, sendSuccessResponse } from "@/utils";
import setCookie from "@/utils/setCookie";

const getAllUsers = async (_: Request, res: Response) => {
  const users = await User.find();
  sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, {
    users,
  });
};

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  const token = getUserIdByToken(req.cookies["hookloop-token"]);

  const { userId } = token as { userId: string };
  const targetUser = await User.findById(userId);

  if (!token || !targetUser) {
    forwardCustomError(next, StatusCode.UNAUTHORIZED, ApiResults.FAIL_TO_GET_DATA, {
      field: "userId",
      error: "The user is not existing!",
    });
  } else if (token && targetUser) {
    const workspaceData = await Workspace.find({ members: userId });

    sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, {
      userData: targetUser,
      workspaceData,
    });
  }
};

const deleteAllUsers = async (_: Request, res: Response) => {
  await User.deleteMany({});
  sendSuccessResponse(res, ApiResults.SUCCESS_DELETE, {
    users: [],
  });
};

const deleteUserById = async (req: Request, res: Response, next: NextFunction) => {
  const token = getUserIdByToken(req.cookies["hookloop-token"]);
  const { userId } = token as { userId: string };
  const targetUser = await User.findById(userId);

  if (!token || !targetUser) {
    forwardCustomError(next, StatusCode.UNAUTHORIZED, ApiResults.FAIL_TO_GET_DATA, {
      field: "userId",
      error: "The user is not existing!",
    });
  } else if (token && targetUser) {
    const options = { new: true, runValidators: true };

    const userData = await User.findByIdAndUpdate(userId, { isActive: false }, options);
    sendSuccessResponse(res, ApiResults.SUCCESS_UPDATE, {
      userData,
    });
  }
};

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, avatar } = req.body;
  const hasExistingEmail = await User.findOne({ email });
  if (hasExistingEmail) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
      field: "email",
      error: "The email is existing!",
    });
    return;
  }

  const securedPassword = await bcrypt.hash(password, 12);
  const newUser = await User.create({
    name,
    email,
    password: securedPassword,
    avatar,
  });
  const token = getJwtToken(newUser.id!);
  setCookie(res, token);
  sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, {
    token,
    name: newUser.name,
  });
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const token = getUserIdByToken(req.cookies["hookloop-token"]);
  const { userId } = token as { userId: string };
  const targetUser = await User.findById(userId);

  const options = { new: true, runValidators: true };
  const { name, email, avatar, isActive } = req.body;

  if (!token || !targetUser) {
    forwardCustomError(next, StatusCode.UNAUTHORIZED, ApiResults.FAIL_TO_GET_DATA, {
      field: "userId",
      error: "The user is not existing!",
    });
  } else if (email) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
      field: "email",
      error: "Email cannot be changed!",
    });
  } else if (name || avatar || isActive) {
    await User.findByIdAndUpdate(userId, req.body, options);
    sendSuccessResponse(res, ApiResults.SUCCESS_UPDATE);
  } else {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
      field: "",
      error: "The column is not existing!",
    });
  }
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteAllUsers,
  deleteUserById,
};
