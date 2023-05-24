import { NextFunction, Request, Response } from "express";

import { forwardCustomError } from "@/middlewares";
import { Workspace } from "@/models";
import { IUser } from "@/models/userModel";
import { ApiResults, StatusCode } from "@/types";
import { sendSuccessResponse } from "@/utils";
import mongoDbHandler from "@/utils/mongoDbHandler";

const getWorkspacesById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!id) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_READ, {
      field: "id",
      error: "Workspace's id is required.",
    });
  } else {
    mongoDbHandler.getDb("Workspace", Workspace, { _id: id }, null, "kanban", res, next);
  }
};

const createWorkspace = async (req: Request, res: Response) => {
  const { id } = req.user as IUser;
  const { name } = req.body;

  const newWorkspace = await Workspace.create({
    name,
    owner: id,
    members: [],
  });
  sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, {
    workspace: newWorkspace,
  });
};

const updateWorkspaceById = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req, res, next);
};

const closeWorkspaceById = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req, res, next);
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
    const targetWorkspaces = await Workspace.find({
      $or: [{ owner: id }, { members: id }],
    });
    sendSuccessResponse(res, ApiResults.SUCCESS_UPDATE, {
      workspace: targetWorkspaces,
    });
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
