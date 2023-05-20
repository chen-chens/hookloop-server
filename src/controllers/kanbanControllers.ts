import { NextFunction, Request, Response } from "express";

import { forwardCustomError } from "@/middlewares";
import { Kanban } from "@/models";
import WorkspaceMember from "@/models/workspaceMemberModel";
import { ApiResults, StatusCode } from "@/types";
import { sendSuccessResponse } from "@/utils";
import mongoDbHandler from "@/utils/mongoDbHandler";

export default {
  createKanban: async (req: Request, res: Response, next: NextFunction) => {
    const { key, name, workspaceId } = req.body;
    if (!key) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "key",
        error: "kanban's key is required.",
      });
    } else if (key.indexOf(" ") > -1) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "key",
        error: "space is not allowed in key.",
      });
    } else if (!name) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "name",
        error: "kanban's name is required.",
      });
    } else if (!workspaceId) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "workspaceId",
        error: "workspaceId is required.",
      });
    } else {
      const existId = await Kanban.findOne({ key });

      if (existId) {
        forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
          field: "key",
          error: "key already exists, unique requirement.",
        });
      } else {
        const newKanban = await Kanban.create({
          key,
          name,
          workspaceId,
        });
        sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, {
          key: newKanban.key,
          name: newKanban.name,
          workspaceId: newKanban.workspaceId,
          listOrder: newKanban.listOrder,
          isArchived: newKanban.isArchived,
        });
      }
    }
  },
  getKanbanByKey: async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    if (!key) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_READ, {
        field: "key",
        error: "Kanban's key is required.",
      });
    } else {
      mongoDbHandler.getDb("Kanban", Kanban, { key }, { _id: 0 }, res, next);
    }
  },
  modifyKanbanKey: async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    const { newKey } = req.body;
    if (!key) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "key",
        error: "Kanban's key is required.",
      });
    } else if (newKey.indexOf(" ") > -1) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "key",
        error: "space is not allowed in key.",
      });
    } else {
      const updateResult = await Kanban.updateOne({ key }, { key: newKey });
      if (!updateResult.matchedCount) {
        forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
          error: `Kanban not found.`,
        });
      } else {
        const target = await Kanban.findOne({ key: newKey }, { _id: 0 });
        if (!target) {
          forwardCustomError(next, StatusCode.INTERNAL_SERVER_ERROR, ApiResults.UNEXPECTED_ERROR);
        } else {
          sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, {
            target,
          });
        }
      }
    }
  },
  renameKanban: async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    const { name } = req.body;
    if (!key) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "key",
        error: "Kanban's key is required.",
      });
    } else if (!name) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "name",
        error: "kanban's name is required.",
      });
    } else {
      mongoDbHandler.updateDb("Kanban", Kanban, { key }, { name }, { _id: 0 }, res, next);
    }
  },
  archiveKanban: async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    const { isArchived } = req.body;
    if (!key) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "key",
        error: "Kanban's key is required.",
      });
    } else if (Object.keys(req.body).indexOf("isArchived") < 0) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "isArchived",
        error: "isArchived is required.",
      });
    } else {
      mongoDbHandler.updateDb("Kanban", Kanban, { key }, { isArchived }, { _id: 0 }, res, next);
    }
  },
  pinKanban: async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    const { isPinned } = req.body;
    if (!key) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "key",
        error: "Kanban's key is required.",
      });
    } else if (Object.keys(req.body).indexOf("isPinned") < 0) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "isPinned",
        error: "isPinned is required.",
      });
    } else {
      mongoDbHandler.updateDb("Kanban", Kanban, { key }, { isPinned }, { _id: 0 }, res, next);
    }
  },
  getKanbanMembers: async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    const kanbanData = await Kanban.findOne({ key });
    if (!kanbanData) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_READ, {
        error: `Kanban not found.`,
      });
    } else {
      const worksoaceData = await WorkspaceMember.findOne({ workspaceId: kanbanData.workspaceId }).populate([
        "workspace",
        "user",
      ]);
      if (!worksoaceData) {
        forwardCustomError(next, StatusCode.INTERNAL_SERVER_ERROR, ApiResults.UNEXPECTED_ERROR);
      } else {
        const membersData = worksoaceData.workspace?.memberIds.map((memberId) => ({
          userId: memberId,
          username: worksoaceData.user?.username,
          role: worksoaceData.role,
        }));
        res.json(membersData);
      }
    }
  },
};
