import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";

import { forwardCustomError } from "@/middlewares";
import { User, Workspace } from "@/models";
import { ApiResults, ApiStatus, StatusCode } from "@/types";
import { getJwtToken, responsePattern, sendSuccessResponse } from "@/utils";

const getAllUsers = async (_: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(StatusCode.OK);
    res.write(
      JSON.stringify({
        status: ApiStatus.SUCCESS,
        users,
      }),
    );
    res.end();
  } catch (error) {
    res.status(StatusCode.INTERNAL_SERVER_ERROR);
    res.write(
      JSON.stringify({
        status: ApiStatus.ERROR,
        message: ApiResults.FAIL_READ,
        error,
      }),
    );
    res.end();
  }
};

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id;
  const targetUser = await User.findById(userId);

  if (!targetUser) {
    forwardCustomError(next, StatusCode.UNAUTHORIZED, ApiResults.FAIL_TO_GET_DATA, {
      field: "userId",
      error: "The user is not existing!",
    });
  } else {
    const workspaceData = await Workspace.find({ members: userId });

    sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, {
      uaerData: targetUser,
      workspaceData,
    });
  }
};

const deleteAllUsers = async (_: Request, res: Response) => {
  try {
    await User.deleteMany({});
    res.status(StatusCode.OK);
    res.write(
      JSON.stringify({
        status: ApiStatus.SUCCESS,
        message: ApiResults.SUCCESS_DELETE,
        users: [],
      }),
    );
    res.end();
  } catch (error) {
    res.status(StatusCode.INTERNAL_SERVER_ERROR);
    res.write(
      JSON.stringify({
        status: ApiStatus.ERROR,
        message: ApiResults.FAIL_DELETE,
        error,
      }),
    );
    res.end();
  }
};

const deleteUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    await User.findByIdAndDelete(userId);
    res.status(StatusCode.OK);
    res.write(
      JSON.stringify({
        status: ApiStatus.SUCCESS,
        message: ApiResults.SUCCESS_DELETE,
      }),
    );
    res.end();
  } catch (error) {
    res.status(StatusCode.INTERNAL_SERVER_ERROR);
    res.write(
      JSON.stringify({
        status: ApiStatus.ERROR,
        message: ApiResults.FAIL_DELETE,
        error,
      }),
    );
    res.end();
  }
};

const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, avatar } = req.body;
    const hasExistingEmail = await User.findOne({ email });
    if (hasExistingEmail) {
      res.status(StatusCode.BAD_REQUEST).send(
        responsePattern(ApiStatus.FAIL, ApiResults.FAIL_CREATE, {
          field: "email",
          error: "The email is existing!",
        }),
      );
      res.end();
    } else {
      const securedPassword = await bcrypt.hash(password, 12);
      const newUser = await User.create({
        name,
        email,
        password: securedPassword,
        avatar,
      });
      res.status(StatusCode.OK).send(
        responsePattern(ApiStatus.SUCCESS, ApiResults.SUCCESS_CREATE, {
          token: getJwtToken(newUser.id!),
          name: newUser.name,
        }),
      );
      res.end();
    }
  } catch (error) {
    console.log(error);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .send(responsePattern(ApiStatus.ERROR, ApiResults.FAIL_CREATE, { error }));
    res.end();
  }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id;
  const options = { new: true, runValidators: true };
  const { name, email, avatar } = req.body;

  if (email) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
      field: "email",
      error: "Email cannot be changed!",
    });
  } else if (name || avatar) {
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, options);
    sendSuccessResponse(res, ApiResults.SUCCESS_UPDATE, {
      updateData: updatedUser,
    });
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
