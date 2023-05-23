import { NextFunction, Request, Response } from "express";

import { forwardCustomError } from "@/middlewares";
import { Card, List } from "@/models";
import { ApiResults, StatusCode } from "@/types";
import { sendSuccessResponse } from "@/utils";
import fileHandler from "@/utils/fileHandler";
import mongoDbHandler from "@/utils/mongoDbHandler";

const createCard = async (req: Request, res: Response, _: NextFunction) => {
  const { name, kanbanId } = req.body;
  const newCard = await Card.create({
    name,
    kanbanId,
  });
  sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, newCard);
};

const getCardById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const card = await Card.findOne({ _id: id, isArchived: false })
    .populate("reporter", "id username avatar")
    .populate("assignee", "id username avatar")
    .populate("tag", "id name color")
    .populate({
      path: "cardComment",
      select: "id currentContent createdAt updatedAt",
      match: { isArchived: false },
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "userId",
        select: "id username avatar",
      },
    });
  if (!card) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_TO_GET_DATA, {
      field: "card",
      error: "Card not found or archived.",
    });
  } else {
    sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, card);
  }
};

const updateCard = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const {
    name,
    description,
    reporter,
    assignee,
    targetStartDate,
    targetEndDate,
    actualStartDate,
    actualEndDate,
    priority,
    status,
    tag,
    webLink,
  } = req.body;

  let updatedWebLink = webLink;
  if (webLink) {
    updatedWebLink = webLink.map((webLinkItem: any) => {
      if (!webLinkItem.name) {
        return {
          ...webLinkItem,
          name: webLinkItem.url,
        };
      }
      return webLinkItem;
    });
  }
  mongoDbHandler.updateDb(
    "Card",
    Card,
    { _id: id },
    {
      name,
      description,
      reporter,
      assignee,
      targetStartDate,
      targetEndDate,
      actualStartDate,
      actualEndDate,
      priority,
      status,
      tag,
      webLink: updatedWebLink,
    },
    {},
    res,
    next,
  );
};

const archiveCard = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { isArchived } = req.body;
  mongoDbHandler.updateDb("Card", Card, { _id: id }, { isArchived }, {}, res, next);
};

const moveCard = async (req: Request, res: Response, next: NextFunction) => {
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
};

const addAttachment = async (req: Request, res: Response, next: NextFunction) => {
  const { file } = req;
  if (!file) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
      field: "file",
      error: "File is required.",
    });
  } else {
    const uploadedFileMeta = await fileHandler.filePost(file, next);
    console.log("uploadedFileMeta: ", uploadedFileMeta);
    if (!uploadedFileMeta) {
      forwardCustomError(next, StatusCode.INTERNAL_SERVER_ERROR, ApiResults.UNEXPECTED_ERROR);
    } else {
      const { cardId } = req.params;
      const { fileId, url } = uploadedFileMeta;
      const { originalname, size, mimetype } = file;
      const attachment = {
        name: originalname,
        url,
        fileId,
        size,
        mimetype,
      };
      mongoDbHandler.updateDb("Card", Card, { _id: cardId }, { $push: { attachment } }, {}, res, next);
    }
  }
};
export default {
  createCard,
  getCardById,
  updateCard,
  archiveCard,
  moveCard,
  addAttachment,
};
