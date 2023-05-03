import bcrypt from "bcryptjs";
import { Request, Response } from "express";

import User from "../models/userModel";
import { ApiResults } from "../types/apiResults";
import ApiStatus from "../types/apiStatus";
import StatusCode from "../types/statusCode";
import getJwtToken from "../utils/getJwtToken";
import responsePattern from "../utils/responsePattern";

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

const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const targetUser = await User.findById(userId);
    res.status(StatusCode.OK);
    res.write(
      JSON.stringify({
        status: ApiStatus.SUCCESS,
        targetUser,
      }),
    );
    res.end();
  } catch (error) {
    res.status(StatusCode.INTERNAL_SERVER_ERROR);
    res.write(
      JSON.stringify({
        status: ApiStatus.ERROR,
        message: ApiResults,
        error,
      }),
    );
    res.end();
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
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .send(responsePattern(ApiStatus.ERROR, ApiResults.FAIL_CREATE, { error }));
    res.end();
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const options = { new: true, runValidators: true };
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, options);

    res.status(StatusCode.OK);
    res.send(
      JSON.stringify({
        status: ApiStatus.SUCCESS,
        message: ApiResults.SUCCESS_UPDATE,
        updatedUser,
      }),
    );

    res.end();
  } catch (error) {
    res.status(StatusCode.INTERNAL_SERVER_ERROR);
    res.send(
      JSON.stringify({
        status: ApiStatus.ERROR,
        message: ApiResults.FAIL_UPDATE,
        error,
      }),
    );

    res.end();
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
