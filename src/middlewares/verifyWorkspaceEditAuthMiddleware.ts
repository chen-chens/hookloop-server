import { NextFunction, Response } from "express";

import { IUser } from "@/models/userModel";
import WorkspaceMember from "@/models/workspaceMemberModel";
import { ApiResults, IWorkspaceRequest, StatusCode } from "@/types";

import { asyncWrapper, forwardCustomError } from "./errorMiddleware";

const verifyWorkspaceEditAuthMiddleware = async (req: IWorkspaceRequest, _: Response, next: NextFunction) => {
  // (1) 檢查 req 有沒有送 workspaceId
  // (2) 檢查使用者 有無修改 workspace 權限
  const { id } = req.user as IUser;
  const { workspaceId } = req.body;

  if (!workspaceId) {
    return forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
      field: "workspaceId",
      error: "The workspaceId is required!",
    });
  }

  const checkUpdateAuth = await WorkspaceMember.findOne({ workspaceId, userId: id });
  if (!checkUpdateAuth || (checkUpdateAuth.role !== "Owner" && checkUpdateAuth.role !== "Admin")) {
    return forwardCustomError(next, StatusCode.FORBIDDEN, ApiResults.FAIL_UPDATE, {
      field: "role",
      error: "Permission denied!",
    });
  }

  return next();
};

export default asyncWrapper(verifyWorkspaceEditAuthMiddleware);
