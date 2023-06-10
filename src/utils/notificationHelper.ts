import { Request } from "express";
import jwt from "jsonwebtoken";

import { Card, Notification } from "@/models";

export default {
  create: async (req: Request, type: string, data: any) => {
    const token = req.headers.authorization!.split(" ")[1];
    const authData = jwt.decode(token, { complete: true });
    const userId = (authData?.payload as any)?.userId;
    // eslint-disable-next-line no-underscore-dangle
    const { id } = data;

    if (type === "card") {
      const card = await Card.findOne({ _id: id }).populate({
        path: "kanbanId",
        select: ["_id", "workspaceId"],
      });

      if (card) {
        let msg = "";
        for (const [key, value] of Object.entries(data)) {
          if (key === "isArchived") {
            msg += value ? "Card is archived." : "Card is unarchived.";
          } else if (key !== "_id" && value !== undefined) {
            const capitalized = key.charAt(0).toUpperCase() + key.slice(1);
            msg += `${capitalized} is updated.\r\n`;
          }
        }

        // 取得所有接收者
        const receivers = [card.reporter, ...card.assignee];

        // 創建 Notification
        for (const receiverId of receivers) {
          if (receiverId) {
            (async function () {
              const newNotification = await Notification.create({
                fromUserId: userId,
                toUserId: receiverId?.toString(),
                subject: card.name,
                cardId: id,
                // eslint-disable-next-line no-underscore-dangle
                kanbanId: card.kanbanId._id.toString(),
                workspaceId: (card.kanbanId as any).workspaceId.toString(),
                content: msg,
              });
              if (!newNotification) {
                console.log("Create notification failed!");
              }
            })();
          }
        }
      }
    }
  },
};
