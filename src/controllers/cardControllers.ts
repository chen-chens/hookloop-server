import { NextFunction, Request, Response } from "express";

import { forwardCustomError } from "@/middlewares";
import { Card } from "@/models";
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
};
