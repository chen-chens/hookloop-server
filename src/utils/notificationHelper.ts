import { Request } from "express";

import { Card, List, Notification } from "@/models";
import { getUserIdByToken, websocketHelper } from "@/utils";

export default {
  create: async (req: Request, id: string, type: string, contentMsgs: string[]) => {
    const bearerToken = req.headers.authorization;
    const token = bearerToken ? getUserIdByToken(bearerToken.split(" ")[1]) : "";
    const { userId } = token as { userId: string };

    let receivers: (string | undefined)[] = [];
    const sendData = {
      fromUserId: userId,
      toUserId: "",
      subject: "",
      content: "",
      cardId: "",
      listId: "",
      kanbanId: "",
      workspaceId: "",
    };

    if (type === "Card") {
      const card = await Card.findOne({ _id: id }).populate({
        path: "kanbanId",
        select: ["_id", "workspaceId"],
      });

      if (card) {
        // 取得所有接收者
        receivers = [card.reporter, ...card.assignee].map((receiver) => receiver?.toString());

        // 設置訊息內容
        sendData.subject = card.name;
        sendData.cardId = id;
        // eslint-disable-next-line no-underscore-dangle
        sendData.kanbanId = card.kanbanId._id.toString();
        sendData.workspaceId = (card.kanbanId as any).workspaceId.toString();
      }
    } else if (type === "List") {
      const list = await List.findOne({ _id: id }).populate({
        path: "kanbanId",
        populate: {
          path: "workspaceId",
        },
        select: ["_id", "workspaceId"],
      });

      if (list) {
        // 取得所有接收者
        const workspaceData = (list.kanbanId as any).workspaceId as any;
        receivers = [...workspaceData.memberIds].map((receiver) => receiver?.toString());

        // 設置訊息內容
        sendData.subject = list.name;
        sendData.listId = id;
        // eslint-disable-next-line no-underscore-dangle
        sendData.kanbanId = list.kanbanId._id.toString();
        // eslint-disable-next-line no-underscore-dangle
        sendData.workspaceId = (list.kanbanId as any).workspaceId._id.toString();
      }
    }

    // 設置 content
    for (const contentMsg of contentMsgs) {
      if (contentMsg !== "updatedAt") {
        if (contentMsg.indexOf(" ") > -1) {
          sendData.content += contentMsg;
        } else {
          const capitalized = contentMsg.charAt(0).toUpperCase() + contentMsg.slice(1);
          sendData.content += `${capitalized} is updated.\r\n`;
        }
      }
    }

    // 移除未使用的屬性
    const sendDataFinal = sendData as any;
    for (const key in sendDataFinal) {
      if (!sendDataFinal[key]) {
        delete sendDataFinal[key];
      }
    }

    // 創建 Notification
    for (const receiverId of receivers) {
      // receiver 不含動作執行者本人
      if (receiverId && receiverId !== userId) {
        sendDataFinal.toUserId = receiverId;
        (async function () {
          const newNotification = await Notification.create(sendDataFinal);
          if (!newNotification) {
            console.log("Create notification failed!");
          } else {
            console.log("Create notification Success!");
            websocketHelper.sendWebSocket(req, receiverId, "notification", newNotification);
          }
        })();
      }
    }
  },
};
