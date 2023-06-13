import { Server as SocketServer } from "ws";

import { websocketHelper } from "@/utils";

export default function runWebSocket(server: any) {
  console.log("Websocket is running.");
  // 將 express 交給 SocketServer 開啟 WebSocket 服務
  const wss = new SocketServer({ server });

  // 當有 client 連線成功時，會觸發這個監聽並建立一個 ws ，ws 中有與 client 的雙向連線資料，可監聽 client 對 ws 的調用，或調用 ws 的方法，傳訊給該 client
  wss.on("connection", (ws) => {
    console.log("Client connected.");

    // 當收到 client 消息時
    ws.on("message", (data) => {
      try {
        // websocket 資料傳遞是 Buffer 格式，需轉成字串，再因專案需求轉為 JSON 格式
        const msg = JSON.parse(data.toString());
        const { type, id } = msg;
        // 取得 client 傳來的資料，由資料判斷 client 的操作(此處自訂為 type 屬性)
        switch (type) {
          case "enterKanban":
            websocketHelper.setClientWSToGroup(type, id, ws);
            // 此處只利用 ws 訊息來建立群組，做為要將ws傳給哪些使用者的依據：當 client 進入看板，用 kanbanId 建立一個群組(array)， 並將 ws 寫入 array，其他使用者若也進入此 kanban，則也將其 ws寫入同個 Kanban array，就可以記錄有哪些 client(ws) 同時在該 kanban
            // 後續要傳訊息給 client 時就可拿群組做 forEach 將訊息傳給在同個 kanban 的每個 client(ws)
            break;
          case "leaveKanban":
            websocketHelper.removeClientWSFromGroup(type, id, ws);
            // 當 client 離開看版，則從該 kanban array中將其 ws 移除，此後就不會收到要傳給該 kanban 上的 client 的消息
            break;
          case "enterCard":
            websocketHelper.setClientWSToGroup(type, id, ws);
            break;
          case "leaveCard":
            websocketHelper.removeClientWSFromGroup(type, id, ws);
            break;
          case "enterNotification":
            websocketHelper.setClientWSToGroup(type, id, ws);
            break;
          case "leaveNotification":
            websocketHelper.removeClientWSFromGroup(type, id, ws);
            break;
          default:
            ws.send(
              JSON.stringify({
                type: "error",
                data: "Invalid type",
              }),
            );
        }
      } catch (e) {
        console.log(e);
        ws.send(
          JSON.stringify({
            type: "error",
            data: e,
          }),
        );
      }
    });
    // 當連線關閉
    ws.on("close", () => {
      console.log("Connection closed.");
    });
  });
}
