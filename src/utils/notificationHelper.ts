import { Request } from "express";

import { Card, Notification } from "@/models";
import { getUserIdByToken, websocketHelper } from "@/utils";

export default {
  create: async (req: Request, id: string, type: string, contentMsgs: string[]) => {
    const bearerToken = req.headers.authorization;
    const token = bearerToken ? getUserIdByToken(bearerToken.split(" ")[1]) : "";
    const { userId } = token as { userId: string };

    if (type === "card") {
      const card = await Card.findOne({ _id: id }).populate({
        path: "kanbanId",
        select: ["_id", "workspaceId"],
      });

      if (card) {
        let msg = "";
        for (const contentMsg of contentMsgs) {
          if (contentMsg !== "updatedAt") {
            if (contentMsg.indexOf(" ") > -1) {
              msg += contentMsg;
            } else {
              const capitalized = contentMsg.charAt(0).toUpperCase() + contentMsg.slice(1);
              msg += `${capitalized} is updated.\r\n`;
            }
          }
        }

        // 取得所有接收者
        const receivers = [card.reporter, ...card.assignee].map((receiver) => receiver?.toString());

        // 創建 Notification
        for (const receiverId of receivers) {
          // receiver 不含動作執行者本人
          if (receiverId && receiverId !== userId) {
            (async function () {
              const newNotification = await Notification.create({
                fromUserId: userId,
                toUserId: receiverId,
                subject: card.name,
                cardId: id,
                // eslint-disable-next-line no-underscore-dangle
                kanbanId: card.kanbanId._id.toString(),
                workspaceId: (card.kanbanId as any).workspaceId.toString(),
                content: msg,
              });
              if (!newNotification) {
                console.log("Create notification failed!");
              } else {
                websocketHelper.sendWebSocket(req, receiverId, "notification", newNotification);
              }
            })();
          }
        }
      }
    }
  },
};
