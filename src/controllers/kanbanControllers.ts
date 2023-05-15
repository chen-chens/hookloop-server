import { NextFunction, Request, Response } from "express";

import { forwardCustomError } from "@/middlewares";
import { Kanban } from "@/models";
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
          workspace: workspaceId,
        });
        sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, {
          key: newKanban.key,
          name: newKanban.name,
          workspaceId: newKanban.workspace,
          listOrder: newKanban.listOrder,
          isArchived: newKanban.isArchived,
        });
      }
    }
  },
  getKanbanByKey: async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    if (!key) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "key",
        error: "Kanban's key is required.",
      });
    } else {
      mongoDbHandler.getDb("Kanban", Kanban, { key }, { _id: 0 }, res, next);
    }
  },
  renameKanban: async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    const { name } = req.body;
    if (!key) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "key",
        error: "Kanban's key is required.",
      });
    } else if (!name) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
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
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "key",
        error: "Kanban's key is required.",
      });
    } else if (Object.keys(req.body).indexOf("isArchived") < 0) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
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
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "key",
        error: "Kanban's key is required.",
      });
    } else if (Object.keys(req.body).indexOf("isPinned") < 0) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "isPinned",
        error: "isPinned is required.",
      });
    } else {
      mongoDbHandler.updateDb("Kanban", Kanban, { key }, { isPinned }, { _id: 0 }, res, next);
    }
  },
};
