import express, { Request, Response } from "express";

const app = express();

const requestListener = async (req: Request, res: Response) => {
  const headers = {
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, PATCH, GET, PUT, DELETE, OPTIONS",
    "Content-Type": "application/json",
  };

  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, headers);
  }
  res.end();
};

app.get("/", requestListener);

app.listen(8088, () => {
  console.log("Server is running!");
});
