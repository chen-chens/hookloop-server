import { Server as SocketServer } from "ws";

import { websocket } from "@/utils";

export default function runWebSocket(server: any) {
  console.log("Websocket is running.");
  // 將 express 交給 SocketServer 開啟 WebSocket 服務
  const wss = new SocketServer({ server });
  const clients: any = {};
  // 當有 client 連線成功時
  wss.on("connection", (ws) => {
    console.log("Client connected.");

    // 當收到client消息時
    ws.on("message", (data) => {
      const msg = JSON.parse(data.toString());
      switch (msg.type) {
        // 也可以只寫一個
        case "enterKanban":
          console.log("enterKanban");
          if (!clients[msg.kanbanId]) {
            clients[msg.kanbanId] = [];
          }
          clients[msg.kanbanId].push(ws);
          break;
        case "leaveKanban":
          console.log("leaveKanban");
          if (clients[msg.kanbanId]) {
            clients[msg.kanbanId].splice(clients[msg.kanbanId].indexOf(ws), 1);
          }
          break;
        case "popUpCard":
          console.log("popUpCard");
          if (!clients[msg.cardId]) {
            clients[msg.cardId] = [];
          }
          clients[msg.cardId].push(ws);
          break;
        case "closeCard":
          console.log("closeCard");
          if (clients[msg.cardId]) {
            clients[msg.cardId].splice(clients[msg.cardId].indexOf(ws), 1);
          }
          break;
        default:
          console.log("default");
      }
      // // 收回來是 Buffer 格式、需轉成字串
      // const str = data.toString();
      // // 發送給所有client：
      // const { clients } = wss; // 取得所有連接中的 client
      // clients.forEach((client) => {
      //   client.send(str); // 發送至每個 client
      // });
    });
    // 當連線關閉
    ws.on("close", () => {
      console.log("Connection closed.");
    });
    websocket.setClients(clients);
  });
}
