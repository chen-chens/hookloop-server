import { NextFunction, Request, Response } from "express";

import { forwardCustomError } from "@/middlewares";
import { Card, CardComment, Kanban, List } from "@/models";
import { ApiResults, StatusCode } from "@/types";
import { sendSuccessResponse, websocketHelper } from "@/utils";
import fileHandler from "@/utils/fileHandler";
import mongoDbHandler from "@/utils/mongoDbHandler";
import notificationHelper from "@/utils/notificationHelper";

const createCard = async (req: Request, res: Response, next: NextFunction) => {
  const { name, kanbanId, listId, socketData } = req.body;
  const newCard = await Card.create({
    name,
    kanbanId,
  });
  const id = "_id";
  const newList = await List.findOneAndUpdate({ _id: listId }, { $push: { cardOrder: newCard[id] } }, { new: true });
  if (!newList) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
      field: "listId",
      error: "List not found",
    });
  }
  sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, newCard);
  websocketHelper.sendWebSocket(req, kanbanId, "createCard", socketData);
};

const getCardById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const card = await Card.findOne({ _id: id, isArchived: false }).populate({
    path: "cardComment",
    select: "_id currentComment userId updatedAt",
    match: { isArchived: false, isEdited: false },
    options: { sort: { createdAt: -1 } },
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
  const { id, kanbanId } = req.params;
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
  const updatedFields = {
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
  };

  const oldCard = (await Card.findOne({ _id: id, isArchived: false })) as any;

  mongoDbHandler.updateDb(res, next, "Card", Card, { _id: id }, updatedFields, {});
  const lists = await Kanban.findOne({ _id: kanbanId }).populate({
    path: "listOrder",
    populate: {
      path: "cardOrder",
    },
  });
  const newCard = (await Card.findOne({ _id: id, isArchived: false }).populate({
    path: "cardComment",
    select: "_id currentComment userId updatedAt",
    match: { isArchived: false, isEdited: false },
    options: { sort: { createdAt: -1 } },
  })) as any;

  // 發送給 kanban
  websocketHelper.sendWebSocket(req, kanbanId, "updateCard", lists);
  // 發送給 card
  websocketHelper.sendWebSocket(req, id, "updateCard", newCard);
  // notification
  const contentTypes = [];
  if (oldCard && newCard) {
    // eslint-disable-next-line no-underscore-dangle
    for (const key of Object.keys(oldCard._doc)) {
      // 新舊 card 不同的欄位發通知
      // eslint-disable-next-line no-underscore-dangle
      if (oldCard._doc[key].toString() !== newCard._doc[key].toString()) {
        contentTypes.push(key);
      }
    }
  }
  notificationHelper.create(req, id, "card", contentTypes);
};

const archiveCard = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { isArchived, listId, kanbanId, socketData } = req.body;
  const newCard = await Card.findOneAndUpdate({ _id: id }, { isArchived }, { new: true });
  if (newCard) {
    const newList = await List.findOneAndUpdate({ _id: listId }, { $pull: { cardOrder: id } }, { new: true });
    if (!newList) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "listId",
        error: "List not found",
      });
    }
    sendSuccessResponse(res, ApiResults.SUCCESS_UPDATE, newCard);
    websocketHelper.sendWebSocket(req, kanbanId, "archiveCard", socketData);
    // notification
    notificationHelper.create(req, id, "card", [isArchived ? "Card is archived." : "Card is unarchived"]);
  }
  forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
    field: "card",
    error: "Card not found",
  });
};

const moveCard = async (req: Request, res: Response, next: NextFunction) => {
  const { kanbanId, oldListId, newListId, oldCardOrder, newCardOrder, socketData } = req.body;
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
          const populatedKanban = await List.findOne({ _id: newListId }).populate({
            path: "kanbanId",
            populate: {
              path: "listOrder",
              populate: {
                path: "cardOrder",
              },
            },
          });

          if (!populatedKanban || !populatedKanban.kanbanId) {
            forwardCustomError(next, StatusCode.INTERNAL_SERVER_ERROR, ApiResults.UNEXPECTED_ERROR);
          } else {
            sendSuccessResponse(res, ApiResults.SUCCESS_UPDATE, populatedKanban.kanbanId);
            websocketHelper.sendWebSocket(req, kanbanId, "moveCard", socketData);
            // notification
            const before = oldListData.cardOrder.map((el: any) => el.toString());
            const after = oldCardOrder;
            const movedCardId = before
              .filter((el: any) => !after.includes(el))
              .concat(after.filter((el: any) => !before.includes(el)))[0];
            if (movedCardId) {
              notificationHelper.create(req, movedCardId, "card", [`Card is moved to "${newListData.name}" list.`]);
            }
          }
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
      const updatedFields = {
        name: originalname,
        url,
        fileId,
        size,
        mimetype,
      };
      // 提醒前端使用 fileId
      mongoDbHandler.updateDb(res, next, "Card", Card, { _id: cardId }, { $push: { attachment: updatedFields } }, {});
      // notification
      notificationHelper.create(req, cardId, "card", ["Attachment is added."]);
    }
  }
};
const deleteAttachment = async (req: Request, res: Response, next: NextFunction) => {
  // 提醒前端提供 fileId
  console.log("req.params: ", req.params);
  const { cardId, attachmentId } = req.params;
  const successfullyDeleted = fileHandler.fileDelete(attachmentId, next);
  if (!successfullyDeleted) {
    forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_DELETE);
  }
  mongoDbHandler.updateDb(
    res,
    next,
    "Card",
    Card,
    { _id: cardId },
    { $pull: { attachment: { fileId: attachmentId } } },
    {},
  );
  // notification
  notificationHelper.create(req, cardId, "card", ["Attachment is deleted."]);
};

const getComments = async (req: Request, res: Response, _: NextFunction) => {
  const { cardId } = req.params;
  const comments = await CardComment.find({ cardId }).sort({ createdAt: -1 });
  sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, comments);
};

const addComment = async (req: Request, res: Response, _: NextFunction) => {
  const { cardId } = req.params;
  const { currentComment, userId } = req.body;
  const updatedFields = { currentComment, userId, cardId };
  const newComment = await CardComment.create(updatedFields);
  const newComments = await CardComment.find({ cardId }).sort({ createdAt: -1 });
  // 發送給 card
  sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, newComment);
  websocketHelper.sendWebSocket(req, cardId, "comments", newComments);
  // notification
  notificationHelper.create(req, cardId, "card", ["Comment is added."]);
};

const updateComment = async (req: Request, res: Response, next: NextFunction) => {
  const { cardId, commentId } = req.params;
  const { currentComment, previousComment, previousCommentTime } = req.body;
  const replaceData = { currentComment, idEdited: true };
  const pushData = { previousComment: { content: previousComment, time: previousCommentTime } };
  mongoDbHandler.updateDb(
    res,
    next,
    "CardComment",
    CardComment,
    { _id: commentId, cardId },
    { $set: replaceData, $push: pushData },
    {},
  );
  // notification
  notificationHelper.create(req, cardId, "card", ["comment"]);
};
const archiveComment = async (req: Request, res: Response, next: NextFunction) => {
  const { cardId, commentId } = req.params;
  mongoDbHandler.updateDb(res, next, "CardComment", CardComment, { _id: commentId, cardId }, { isArchived: true }, {});
};
const getCommentHistory = async (req: Request, res: Response, next: NextFunction) => {
  const { cardId, commentId } = req.params;
  mongoDbHandler.getDb(res, next, "CardComment", CardComment, { _id: commentId, cardId }, {});
};
export default {
  createCard,
  getCardById,
  updateCard,
  archiveCard,
  moveCard,
  addAttachment,
  deleteAttachment,
  getComments,
  addComment,
  updateComment,
  archiveComment,
  getCommentHistory,
};
