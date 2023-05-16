import { NextFunction, Request, Response } from "express";

import { forwardCustomError } from "@/middlewares";
import { Kanban, List } from "@/models";
import { ApiResults, StatusCode } from "@/types";
import { sendSuccessResponse } from "@/utils";
import mongoDbHandler from "@/utils/mongoDbHandler";

export default {
  createList: async (req: Request, res: Response, next: NextFunction) => {
    const { name, kanbanId } = req.body;
    if (!name) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "name",
        error: "List's name is required.",
      });
    } else if (!kanbanId) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "kanbanId",
        error: "kanbanId is required.",
      });
    } else {
      const newList = await List.create({
        name,
        kanbanId,
      });
      sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, newList);
    }
  },
  getListById: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_READ, {
        field: "id",
        error: "List's id is required.",
      });
    } else {
      mongoDbHandler.getDb("List", List, { _id: id }, {}, res, next);
    }
  },
  renameList: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "name",
        error: "List's name is required.",
      });
    } else {
      mongoDbHandler.updateDb("List", List, { _id: id }, { name }, {}, res, next);
    }
  },
  archiveList: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { isArchived } = req.body;
    if (Object.keys(req.body).indexOf("isArchived") < 0) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "isArchived",
        error: "isArchived is required.",
      });
    } else {
      mongoDbHandler.updateDb("List", List, { _id: id }, { isArchived }, {}, res, next);
    }
  },
  moveList: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { listOrder } = req.body;
    if (!listOrder) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "listOrder",
        error: "listOrder is required.",
      });
    } else {
      const listData = await List.findOne({ _id: id }).catch((err: Error) => {
        console.log("MongoDb UPDATE error: ", err);
        forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_READ, {
          error: `List not found.`,
        });
      });
      if (!listData) {
        forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_READ, {
          error: `List not found.`,
        });
      } else {
        const kanbanUpdateResult = await Kanban.updateOne({ _id: listData.kanbanId }, { listOrder }).catch(
          (err: Error) => {
            console.log("MongoDb UPDATE Kanban error: ", err);
          },
        );
        if (!kanbanUpdateResult || !kanbanUpdateResult.matchedCount) {
          forwardCustomError(next, StatusCode.INTERNAL_SERVER_ERROR, ApiResults.UNEXPECTED_ERROR);
        } else {
          sendSuccessResponse(res, ApiResults.SUCCESS_UPDATE);
        }
      }
    }
  },
};
