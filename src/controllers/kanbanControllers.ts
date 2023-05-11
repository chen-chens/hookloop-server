import { NextFunction, Request, Response } from "express";

import { forwardCustomError } from "@/middlewares";
import { Kanban } from "@/models";
import { ApiResults, StatusCode } from "@/types";
import { sendSuccessResponse } from "@/utils";

export default {
  createKanban: async (req: Request, res: Response, next: NextFunction) => {
    const { id, name, workspaceId } = req.body;
    if (!id) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "id",
        error: "kanban's id is required.",
      });
    } else if (id.indexOf(" ") > -1) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "id",
        error: "space is not allowed in id.",
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
      const existId = await Kanban.findOne({ id });

      if (existId) {
        forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
          field: "id",
          error: "id already exists, unique requirement.",
        });
      } else {
        const newKanban = await Kanban.create({
          id,
          name,
          workspace: workspaceId,
        });
        sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, {
          id: newKanban.id,
          name: newKanban.name,
          workspaceId: newKanban.workspace,
          cardLists: newKanban.cardLists,
          isArchived: newKanban.isArchived,
        });
      }
    }
  },
};
