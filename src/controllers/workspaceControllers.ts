import { NextFunction, Request, Response } from "express";

import dbOptions from "@/config/dbOptions";
import { forwardCustomError } from "@/middlewares";
import { Workspace } from "@/models";
import { IUser } from "@/models/userModel";
import WorkspaceMember from "@/models/workspaceMemberModel";
import { ApiResults, StatusCode } from "@/types";
import { sendSuccessResponse } from "@/utils";

const getWorkspacesById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.body;
  const targetWorkspace = await WorkspaceMember.findOne({ workspaceId: id }).populate(["workspace", "user"]).exec();
  if (!targetWorkspace) {
    forwardCustomError(next, StatusCode.NOT_FOUND, ApiResults.FAIL_TO_GET_DATA, {
      field: "id",
      error: "The workspace is not existing!",
    });
    return;
  }

  sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, {
    id: targetWorkspace.workspaceId,
    workspaceName: targetWorkspace.workspace?.name,
    kanbans: targetWorkspace.workspace?.kanbans,
    members: targetWorkspace.workspace?.memberIds.map((memberId) => ({
      userId: memberId,
      username: targetWorkspace.user?.username,
      role: targetWorkspace.role,
    })),
  });
};

const createWorkspace = async (req: Request, res: Response) => {
  const { id, username } = req.user as IUser;
  const { name } = req.body;

  const newWorkspace = new Workspace({ name });
  const newWorkspaceMember = new WorkspaceMember({
    workspaceId: newWorkspace.id,
    userId: id,
    role: "Owner",
  });
  newWorkspace.memberIds.push(newWorkspaceMember.id);
  const [newWorkspaceResult, newWorkspaceMemberResult] = await Promise.all([
    newWorkspace.save(),
    newWorkspaceMember.save(),
  ]);

  sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, {
    id: newWorkspaceResult.id,
    workspaceName: newWorkspaceResult.name,
    kanbans: newWorkspaceResult.kanbans,
    members: [{ userId: newWorkspaceMemberResult.userId, username, role: newWorkspaceMemberResult.role }],
  });
};

const updateWorkspaceById = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req, res, next);
};

const closeWorkspaceById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.body;

  const updateResult = await Workspace.findByIdAndUpdate({ _id: id }, { isArchived: true }, dbOptions);
  if (!updateResult) {
    forwardCustomError(next, StatusCode.NOT_FOUND, ApiResults.FAIL_UPDATE, {
      field: "id",
      error: "The workspace is not existing!",
    });
    return;
  }

  sendSuccessResponse(res, ApiResults.SUCCESS_UPDATE, {
    id: updateResult.id,
    workspaceName: updateResult.name,
    isArchived: updateResult.isArchived,
  });
};

const getAvailableUsersByWorkspaceId = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req, res, next);
};

const addPinnedByWorkspaceId = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req, res, next);
};

const deleteUserFromWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req, res, next);
};

const getWorkspacesByUserId = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.user as IUser;

  if (!id) {
    forwardCustomError(next, StatusCode.UNAUTHORIZED, ApiResults.FAIL_TO_GET_DATA, {
      field: "userId",
      error: "The user is not existing!",
    });
  } else {
    const targetWorkspaces = await WorkspaceMember.find({ userId: id }).populate(["workspace", "user"]).exec();
    const responseData = targetWorkspaces.map((item) => ({
      id: item.workspaceId,
      workspaceName: item.workspace?.name,
      kanbans: item.workspace?.kanbans,
      members: item.workspace?.memberIds.map((memberId) => ({
        userId: memberId,
        username: item.user?.username,
        role: item.role,
      })),
    }));
    sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, responseData);
  }
};

export default {
  getWorkspacesById,
  createWorkspace,
  updateWorkspaceById,
  closeWorkspaceById,
  getAvailableUsersByWorkspaceId,
  addPinnedByWorkspaceId,
  deleteUserFromWorkspace,
  getWorkspacesByUserId,
};
