import { NextFunction, Request, Response } from "express";

import dbOptions from "@/config/dbOptions";
import { forwardCustomError } from "@/middlewares";
import { Workspace } from "@/models";
import { IUser } from "@/models/userModel";
import WorkspaceMember, { IWorkspaceMember } from "@/models/workspaceMemberModel";
import {
  ApiResults,
  IDeleteUserFromWorkspaceRequest,
  IRequestMembers,
  IWorkspaceRequest,
  RoleType,
  StatusCode,
} from "@/types";
import { sendSuccessResponse } from "@/utils";

const getWorkspacesById = async (req: Request, res: Response, next: NextFunction) => {
  const { workspaceId } = req.body;
  const targetWorkspaceMembers = await WorkspaceMember.find({ workspaceId }).populate(["workspace", "user"]).exec();
  if (!targetWorkspaceMembers) {
    forwardCustomError(next, StatusCode.NOT_FOUND, ApiResults.FAIL_TO_GET_DATA, {
      field: "id",
      error: "The workspace is not existing!",
    });
    return;
  }
  const [targetWorkspaceMember] = targetWorkspaceMembers;
  sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, {
    workspaceId: targetWorkspaceMember.workspaceId,
    workspaceName: targetWorkspaceMember.workspace?.name,
    updatedAt: targetWorkspaceMember.workspace?.updatedAt,
    isArchived: targetWorkspaceMember.workspace?.isArchived,
    kanbans: targetWorkspaceMember.workspace?.kanbans,
    members: targetWorkspaceMembers.map((workspaceMember) => ({
      userId: workspaceMember.userId,
      username: workspaceMember.user?.username,
      role: workspaceMember.role,
    })),
  });
};

const createWorkspace = async (req: IWorkspaceRequest, res: Response, next: NextFunction) => {
  const { workspaceName, members } = req.body;

  if (!workspaceName) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
      field: "workspaceName",
      error: "The workspace name is required!",
    });
    return;
  }
  if (!members || (members && members.length === 0)) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
      field: "members",
      error: "The members is required!",
    });
    return;
  }

  const uniqueMemberIds = new Set(members.map((member) => member.userId));
  const hasDuplicateUserId = members.length > uniqueMemberIds.size;
  if (hasDuplicateUserId) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
      field: "userId",
      error: "The user role should be unique !",
    });
    return;
  }

  const hasInvalidRole = members.some((member) => !Object.values(RoleType).includes(member.role));
  if (hasInvalidRole) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
      field: "role",
      error: "Invalid RoleType ! Please check again! ",
    });
    return;
  }

  const newWorkspace = new Workspace({ name: workspaceName });
  const newWorkspaceMembers: IWorkspaceMember[] = members.map((member: IRequestMembers) => {
    const newWorkspaceMember = new WorkspaceMember({
      workspaceId: newWorkspace.id,
      userId: member.userId,
      role: member.role,
    });
    newWorkspace.memberIds.push(newWorkspaceMember.userId);

    return newWorkspaceMember;
  });

  const [newWorkspaceResult, ...newWorkspaceMembersResults] = await Promise.all([
    newWorkspace.save(),
    ...newWorkspaceMembers.map((newWorkspaceMember) => newWorkspaceMember.save()),
  ]);

  sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, {
    workspaceId: newWorkspaceResult.id,
    workspaceName: newWorkspaceResult.name,
    kanbans: newWorkspaceResult.kanbans,
    members: newWorkspaceMembersResults.map((newWorkspaceMembersResult) => ({
      userId: newWorkspaceMembersResult.userId,
      role: newWorkspaceMembersResult.role,
    })),
  });
};

const updateWorkspaceById = async (req: IWorkspaceRequest, res: Response, next: NextFunction) => {
  const { workspaceName, members, workspaceId } = req.body;

  if (workspaceName) {
    const updateResult = await Workspace.findByIdAndUpdate({ _id: workspaceId }, { name: workspaceName }, dbOptions);
    if (!updateResult) {
      forwardCustomError(next, StatusCode.NOT_FOUND, ApiResults.FAIL_UPDATE, {
        field: "workspaceId",
        error: "The workspace is not existing!",
      });
    } else {
      sendSuccessResponse(res, ApiResults.SUCCESS_UPDATE, {
        workspaceId: updateResult.id,
        workspaceName: updateResult.name,
      });
    }
    return;
  }

  if (members && members.length > 0) {
    const uniqueMemberIds = new Set(members.map((member) => member.userId));
    const hasDuplicateUserId = members.length > uniqueMemberIds.size;
    if (hasDuplicateUserId) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "userId",
        error: "The user role should be unique !",
      });
      return;
    }

    const hasInvalidRole = members.some((member) => !Object.values(RoleType).includes(member.role));
    if (hasInvalidRole) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "role",
        error: "Invalid RoleType! Please check again! ",
      });
      return;
    }
    const hasOwnerRequest = members.some((member) => member.role === RoleType.OWNER);
    if (hasOwnerRequest) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "role",
        error: "Invalid Request! Owner is unique!",
      });
      return;
    }

    const targetWorkspace = await Workspace.findOne({ _id: workspaceId });
    if (!targetWorkspace) {
      forwardCustomError(next, StatusCode.NOT_FOUND, ApiResults.FAIL_UPDATE, {
        field: "workspaceId",
        error: "The workspace is not existing!",
      });
      return;
    }

    members.forEach(async (member) => {
      const existingMember = await WorkspaceMember.findOne({ workspaceId, userId: member.userId });
      if (existingMember) {
        existingMember.role = member.role;
        await existingMember.save();
      } else {
        const newWorkspaceMember = new WorkspaceMember({
          workspaceId,
          userId: member.userId,
          role: member.role,
        });
        await newWorkspaceMember.save();
        targetWorkspace.memberIds.push(newWorkspaceMember.userId);
      }
    });

    await targetWorkspace.save();
    const updatedWorkspaceMembers = await WorkspaceMember.find({ workspaceId }).populate(["workspace", "user"]).exec();
    const [updatedWorkspaceMember] = updatedWorkspaceMembers;
    sendSuccessResponse(res, ApiResults.SUCCESS_UPDATE, {
      workspaceId: updatedWorkspaceMember.workspace?.id,
      workspaceName: updatedWorkspaceMember.workspace?.name,
      // members: updatedWorkspaceMembers.map((workspaceMember) => ({
      //   userId: workspaceMember.userId,
      //   username: workspaceMember.user?.username,
      //   role: workspaceMember.role,
      // })),
    });
    return;
  }

  forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
    field: "",
    error: "Invalid Request! Please input revised values!",
  });
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
    workspaceId: updateResult.id,
    workspaceName: updateResult.name,
    isArchived: updateResult.isArchived,
  });
};

const deleteUserFromWorkspace = async (req: IDeleteUserFromWorkspaceRequest, res: Response, next: NextFunction) => {
  const { workspaceId, memberId } = req.body;
  if (!workspaceId) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_DELETE, {
      field: "",
      error: "The workspaceId is required!",
    });
    return;
  }
  if (!memberId) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_DELETE, {
      field: "memberId",
      error: "The memberId is required!",
    });
    return;
  }

  const targetWorkspaceMember = await WorkspaceMember.findOne({ workspaceId, userId: memberId });
  if (!targetWorkspaceMember) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_DELETE, {
      field: "",
      error: "The member is not existing in this workspace!",
    });
    return;
  }

  const isTargetMemberWithOwnerType = !!(targetWorkspaceMember.role === RoleType.OWNER);
  if (isTargetMemberWithOwnerType) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_DELETE, {
      field: "",
      error: "The owner can't be removed!",
    });
    return;
  }

  await WorkspaceMember.findOneAndDelete({ workspaceId, userId: memberId });
  sendSuccessResponse(res, ApiResults.SUCCESS_DELETE);
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
      workspaceId: item.workspaceId,
      workspaceName: item.workspace?.name,
      updatedAt: item.workspace?.updatedAt,
      isArchived: item.workspace?.isArchived,
      kanbans: item.workspace?.kanbans,
      members: item.workspace?.memberIds.map((memberId) => ({
        userId: memberId,
        username: item.user?.username,
        isArchived: item.user?.isArchived,
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
  deleteUserFromWorkspace,
  getWorkspacesByUserId,
};
