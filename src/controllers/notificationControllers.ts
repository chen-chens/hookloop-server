import { NextFunction, Request, Response } from "express";

import { Notification } from "@/models";
import { ApiResults } from "@/types";
import { sendSuccessResponse } from "@/utils";
import mongoDbHandler from "@/utils/mongoDbHandler";

export default {
  getNotificationsByUserId: async (req: Request, res: Response) => {
    const { userId } = req.params;
    const notifications = await Notification.find({
      toUserId: userId,
    }).populate([
      { path: "fromUserId", select: ["username", "avatar"] },
      { path: "toUserId", select: "username" },
      { path: "workspaceId", select: "name" },
      { path: "kanbanId", select: ["name", "key"] },
      { path: "cardId", select: "name" },
    ]);
    sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, notifications);
  },
  isReadNotification: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    mongoDbHandler.updateDb(res, next, "Notification", Notification, { _id: id }, { isRead: true });
  },
  markAllIsReadByUserId: async (req: Request, res: Response) => {
    const { userId } = req.params;
    const newNotifications = await Notification.updateMany(
      {
        toUserId: userId,
        isRead: false,
      },
      {
        toUserId: userId,
        isRead: true,
      },
    );
    sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, newNotifications);
  },
};
