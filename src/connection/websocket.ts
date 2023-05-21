import { Server as SocketServer } from "ws";

export default function runWebSocket(server: any) {
  console.log("Websocket is running.");
  // 將 express 交給 SocketServer 開啟 WebSocket 服務
  const wss = new SocketServer({ server });

  // 當有 client 連線成功時
  wss.on("connection", (ws) => {
    console.log("Client connected.");

    // 當收到client消息時
    ws.on("message", (data) => {
      // 收回來是 Buffer 格式、需轉成字串
      const str = data.toString();

      // 發送給所有client：
      const { clients } = wss; // 取得所有連接中的 client
      clients.forEach((client) => {
        client.send(str); // 發送至每個 client
      });
    });

    // 當連線關閉
    ws.on("close", () => {
      console.log("Connection closed.");
    });
  });
}
