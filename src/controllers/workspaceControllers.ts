import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import dbOptions from "@/config/dbOptions";
import { forwardCustomError } from "@/middlewares";
import { User, Workspace } from "@/models";
import { IUser } from "@/models/userModel";
import WorkspaceMember, { IWorkspaceMember } from "@/models/workspaceMemberModel";
// import { IWorkspace } from "@/models/workspaceModel";
import {
  ApiResults,
  IDeleteUserFromWorkspaceRequest,
  IRequestMembers,
  IWorkspaceRequest,
  RoleType,
  StatusCode,
} from "@/types";
import { sendSuccessResponse } from "@/utils";
import mongoDbHandler from "@/utils/mongoDbHandler";

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

const getKanbansByWorkspaceId = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!id) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_READ, {
      field: "id",
      error: "Workspace's id is required.",
    });
  } else {
    const result = await mongoDbHandler.getDb(null, next, "Workspace", Workspace, { _id: id });
    sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, {
      kanbans: result?.kanbans ?? [],
    });
  }
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
  // console.log("workspaceName 檢查ok");
  if (!members || (members && members.length === 0)) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
      field: "members",
      error: "The members is required!",
    });
    return;
  }
  // console.log("members 檢查ok");
  const uniqueMemberIds = new Set(members.map((member) => member.userId));
  const hasDuplicateUserId = members.length > uniqueMemberIds.size;
  if (hasDuplicateUserId) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
      field: "userId",
      error: "The user role should be unique !",
    });
    return;
  }
  // console.log("members 是否重複 檢查ok");
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
    // console.log("newWorkspaceMember = ", newWorkspaceMember);
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
  }
  // console.log("workspaceName 檢查 ok");
  if (members && members.length > 0) {
    const uniqueMemberIds = new Set(members.map((member) => member.userId));
    // console.log("uniqueMemberIds = ", uniqueMemberIds);
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
    // 找到要更新的 workspace
    const targetWorkspace = await Workspace.findOne({ _id: workspaceId });

    // console.log("要更新的 workspace = ", targetWorkspace);

    // 檢查要更新的 workspace 是否存在
    if (!targetWorkspace) {
      forwardCustomError(next, StatusCode.NOT_FOUND, ApiResults.FAIL_UPDATE, {
        field: "workspaceId",
        error: "The workspace is not existing!",
      });
      return;
    }
    // console.log("要更新的 workspace 存在", members);

    const bulkOperations = members
      // 要刪除的就不更新了
      .filter((member) => member.state !== "delete")
      .map((member) => ({
        updateOne: {
          filter: { workspaceId, userId: member.userId },
          update: {
            $set: {
              role: member.role,
            },
          },
          upsert: true, // 資料庫不存在就新建
        },
      }));
    // 修改 member
    await WorkspaceMember.bulkWrite(bulkOperations);

    // console.log("result = ", result);
    // 取出要新建的 member
    const createMembers = members.filter((member) => member.state === "create").map((member) => member.userId);
    // console.log("createMembers = ", createMembers);
    // 取出要刪除的 member
    const deleteMembers = members
      .filter((member) => member.state === "delete")
      .map((member) => new mongoose.Types.ObjectId(member.userId).toString());

    const tmpMemberIds = [...targetWorkspace.memberIds, ...createMembers].reduce((prev, curr) => {
      const currObjectId = new mongoose.Types.ObjectId(curr).toString();
      if (deleteMembers.includes(currObjectId)) {
        return prev;
      }
      (prev as string[]).push(curr as IRequestMembers["userId"]);
      return prev;
    }, []);

    // console.log("tmpMemberIds = ", tmpMemberIds);
    targetWorkspace.memberIds = tmpMemberIds;
    await targetWorkspace.save();

    sendSuccessResponse(res, ApiResults.SUCCESS_UPDATE, {
      // workspaceId: updatedWorkspaceMember.workspace?.["_id"],
      // workspaceName: updatedWorkspaceMember.workspace?.name,
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
  const { workspaceId } = req.body;
  const updateResult = await Workspace.findByIdAndUpdate({ _id: workspaceId }, { isArchived: true }, dbOptions);
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
  // console.log("user id = ", id);
  if (!id) {
    forwardCustomError(next, StatusCode.UNAUTHORIZED, ApiResults.FAIL_TO_GET_DATA, {
      field: "userId",
      error: "The user is not existing!",
    });
  } else {
    // console.log("有傳ID 繼續執行");
    // 使用使用者ID查詢目標工作區成員資料
    const targetWorkspaces = await WorkspaceMember.find({ userId: id }).populate(["workspace", "user"]).exec();
    // console.log("使用user id找到的workspace = ", targetWorkspaces);
    // 並行處理每個工作區的成員資料查詢
    const responseData = await Promise.all(
      targetWorkspaces.map(async (item) => {
        // 查詢並處理每個成員的使用者資料
        const members = await Promise.all(
          Array.from(item.workspace?.memberIds || [], async (memberId) => {
            const memberData = await User.findById(memberId);
            const roleData = await WorkspaceMember.find({ userId: memberId, workspaceId: item.workspaceId });

            return {
              userId: memberId,
              username: memberData?.username,
              isArchived: memberData?.isArchived,
              // role: item.role,
              avatar: memberData?.avatar,
              role: roleData[0]?.role || "",
            };
          }),
        );
        const nowWorkspace = await Workspace.findOne({ _id: item.workspaceId }).populate("kanbans");
        // console.log("nowWorkspace = ", nowWorkspace);
        return {
          workspaceId: item.workspaceId,
          workspaceName: item.workspace?.name,
          updatedAt: item.workspace?.updatedAt,
          isArchived: item.workspace?.isArchived,
          // kanbans: item.workspace?.kanbans,
          kanbans: nowWorkspace?.kanbans,
          members,
        };
      }),
    );
    // console.log("回傳的資料 = ", responseData);
    // 回傳成功回應以及查詢到的資料
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
  getKanbansByWorkspaceId,
};
