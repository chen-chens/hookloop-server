import { NextFunction, Request, Response } from "express";

import { forwardCustomError } from "@/middlewares";
import { Kanban, List } from "@/models";
import { ApiResults, StatusCode } from "@/types";
import { sendSuccessResponse, websocketHelper } from "@/utils";
import mongoDbHandler from "@/utils/mongoDbHandler";
import notificationHelper from "@/utils/notificationHelper";

export default {
  createList: async (req: Request, res: Response, next: NextFunction) => {
    const { name, kanbanId, socketData } = req.body;
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

      const id = "_id";
      await Kanban.findOneAndUpdate(
        { _id: kanbanId },
        {
          $push: { listOrder: newList[id] },
        },
      );

      const lists = await Kanban.findOne({ _id: kanbanId }).populate("listOrder").select("listOrder");
      if (!lists) {
        forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_READ, {
          error: `lists not found.`,
        });
      } else {
        sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, lists);
        websocketHelper.sendWebSocket(req, kanbanId, "createList", socketData);
      }

      // sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, newList);
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
      mongoDbHandler.getDb(res, next, "List", List, { _id: id });
    }
  },
  renameList: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { kanbanId, list, socketData } = req.body;
    if (!list.name) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "name",
        error: "List's name is required.",
      });
    } else {
      mongoDbHandler.updateDb(res, next, "List", List, { _id: id }, { name: list.name });
      websocketHelper.sendWebSocket(req, kanbanId, "renameList", socketData);
      // notification
      notificationHelper.create(req, id, "List", [`Name is updated to "${list.name}".`]);
    }
  },
  archiveList: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { isArchived, kanbanId, socketData } = req.body;
    if (Object.keys(req.body).indexOf("isArchived") < 0) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "isArchived",
        error: "isArchived is required.",
      });
    } else {
      mongoDbHandler.updateDb(res, next, "List", List, { _id: id }, { isArchived });
      websocketHelper.sendWebSocket(req, kanbanId, "archiveList", socketData);
      // notification
      notificationHelper.create(req, id, "List", [isArchived ? "List is archived." : "List is unarchived."]);
    }
  },
  moveList: async (req: Request, res: Response, next: NextFunction) => {
    const { kanbanId, listOrder } = req.body;
    if (!kanbanId) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "kanbanId",
        error: "kanbanId is required.",
      });
    } else if (!listOrder) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "listOrder",
        error: "listOrder is required.",
      });
    } else {
      const kanbanData = await Kanban.findOne({ _id: kanbanId }).catch((err: Error) => {
        console.log("MongoDb UPDATE error: ", err);
      });
      if (!kanbanData) {
        forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_READ, {
          error: `Kanban not found.`,
        });
      } else {
        const kanbanUpdateResult = await Kanban.updateOne({ _id: kanbanId }, { listOrder }).catch((err: Error) => {
          console.log("MongoDb UPDATE error: ", err);
        });
        console.log("kanbanUpdateResult = ", kanbanUpdateResult);
        if (!kanbanUpdateResult || !kanbanUpdateResult.matchedCount) {
          forwardCustomError(next, StatusCode.INTERNAL_SERVER_ERROR, ApiResults.UNEXPECTED_ERROR);
        } else {
          const lists = await Kanban.findOne({ _id: kanbanId }).populate({
            path: "listOrder",
            populate: {
              path: "cardOrder",
            },
          });
          if (!lists) {
            forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_READ, {
              error: `lists not found.`,
            });
          } else {
            sendSuccessResponse(res, ApiResults.SUCCESS_UPDATE, lists);
            websocketHelper.sendWebSocket(req, kanbanId, "moveList", lists);
          }
        }
      }
    }
  },
};
