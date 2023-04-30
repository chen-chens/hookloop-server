import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import path from "path";

import Member from "./models/memberModel";

dotenv.config({ path: path.join(__dirname, "../.env") });

// Connect mongoDB
const DB = process.env.MONGO_DB?.replace("<password>", process.env.MONGO_DB_PASSWORD || "") || "";
mongoose
  .connect(DB)
  .then(() => {
    console.log("MongoDB is running!");
  })
  .catch((error) => {
    console.log("MongoDB can't connect!", error);
  });

const app = express();

app.use((req: Request, res: Response, next: NextFunction) => {
  const headers = {
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, POST, PATCH, DELETE, OPTIONS",
    "Content-Type": "application/json",
  };
  res.header(headers);
  next();
});

app.post("/users", async (req: Request, res: Response) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", async () => {
    try {
      const { name, email, password, avatar } = JSON.parse(body);
      const newMember = await Member.create({
        name,
        email,
        password,
        avatar,
      });
      res.status(200);
      res.send(
        JSON.stringify({
          status: "success",
          message: "資料寫入成功 ！",
          newMember,
        }),
      );

      res.end();
    } catch (error) {
      res.status(500);
      res.send(
        JSON.stringify({
          status: "fail",
          message: `POST /users 資料寫入失敗 err: ${error}`,
        }),
      );

      res.end();
    }
  });
});

app.get("/users", async (req: Request, res: Response) => {
  const members = await Member.find();
  res.status(200);
  res.write(
    JSON.stringify({
      status: "success",
      members,
    }),
  );
  res.end();
});

app.listen(8080, "localhost", () => {
  console.log("Server is running again!");
});
