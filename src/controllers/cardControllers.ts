import { NextFunction, Request, Response } from "express";

import { forwardCustomError } from "@/middlewares";
import { Card, List } from "@/models";
import { ApiResults, StatusCode } from "@/types";
import { sendSuccessResponse } from "@/utils";
import mongoDbHandler from "@/utils/mongoDbHandler";

export default {
  createCard: async (req: Request, res: Response, next: NextFunction) => {
    const { name, kanbanId } = req.body;
    if (!name) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "name",
        error: "Card's name is required.",
      });
    } else if (!kanbanId) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "kanbanId",
        error: "kanbanId is required.",
      });
    } else {
      const newCard = await Card.create({
        name,
        kanbanId,
      });
      sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, newCard);
    }
  },
  getCardById: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    mongoDbHandler.getDb("Card", Card, { _id: id }, {}, res, next);
  },
  archiveCard: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { isArchived } = req.body;
    if (Object.keys(req.body).indexOf("isArchived") < 0) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "isArchived",
        error: "isArchived is required.",
      });
    } else {
      mongoDbHandler.updateDb("Card", Card, { _id: id }, { isArchived }, {}, res, next);
    }
  },
  moveCard: async (req: Request, res: Response, next: NextFunction) => {
    const { oldListId, newListId, oldCardOrder, newCardOrder } = req.body;
    if (!oldListId) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "oldListId",
        error: "oldListId is required.",
      });
    } else if (!newListId) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "newListId",
        error: "newListId is required.",
      });
    } else if (!oldCardOrder) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "oldCardOrder",
        error: "oldCardOrder is required.",
      });
    } else if (!newCardOrder) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "newCardOrder",
        error: "newCardOrder is required.",
      });
    } else {
      const oldListData = await List.findOne({ _id: oldListId }).catch((err: Error) => {
        console.log("MongoDb UPDATE error: ", err);
      });
      const newListData = await List.findOne({ _id: newListId }).catch((err: Error) => {
        console.log("MongoDb UPDATE error: ", err);
      });
      if (!oldListData) {
        forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_READ, {
          error: `oldList not found.`,
        });
      } else if (!newListData) {
        forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_READ, {
          error: `newList not found.`,
        });
      } else {
        try {
          const oldListUpdateResult = await List.updateOne({ _id: oldListId }, { cardOrder: oldCardOrder });
          const newListUpdateResult = await List.updateOne({ _id: newListId }, { cardOrder: newCardOrder });
          if (
            !oldListUpdateResult ||
            !oldListUpdateResult.matchedCount ||
            !newListUpdateResult ||
            !newListUpdateResult.matchedCount
          ) {
            forwardCustomError(next, StatusCode.INTERNAL_SERVER_ERROR, ApiResults.UNEXPECTED_ERROR);
          } else {
            sendSuccessResponse(res, ApiResults.SUCCESS_UPDATE);
          }
        } catch (error) {
          console.log("MongoDb UPDATE List error: ", error);
        }
      }
    }
  },
};
