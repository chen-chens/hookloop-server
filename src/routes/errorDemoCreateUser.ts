// FIXME: Remove this file after demo
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";

import { forwardCustomError } from "@/middlewares";
import { User } from "@/models";
import { ApiResults, StatusCode } from "@/types";
import { getJwtToken, sendSuccessResponse } from "@/utils";

const errorDemoCreateUser = async (req: Request, res: Response, next: NextFunction) => {
  console.log("errorDemoCreateUser");
  const { name, email, password, avatar } = req.body;
  const hasExistingEmail = await User.findOne({ email });
  if (hasExistingEmail) {
    console.log("hasExistingEmail");
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
      field: "email",
      error: "The email is existing!",
    });
  } else {
    console.log("createUser");
    const securedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      name,
      email,
      password: securedPassword,
      avatar,
    });
    sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, {
      token: getJwtToken(newUser.id!),
      name: newUser.name,
    });
  }
};

export default errorDemoCreateUser;
