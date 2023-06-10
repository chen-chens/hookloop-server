import { Request } from "express";
import jwt from "jsonwebtoken";

import { IDecodedToken } from "@/types";

// import { IUser } from "@/models/userModel";

let clientsWSGroup: any = {};
function setGlobalClientsWSGroup(newClientsWSGroup: any) {
  clientsWSGroup = newClientsWSGroup;
}
function getGlobalClientsWSGroup() {
  return clientsWSGroup;
}

const setClientWSToGroup = (type: string, id: string, ws: any) => {
  console.log(type);
  const group = getGlobalClientsWSGroup();
  if (!group[id]) {
    group[id] = [];
  }
  group[id].push(ws);
  setGlobalClientsWSGroup(group);
};

const removeClientWSFromGroup = (type: string, id: string, ws: any) => {
  console.log(type);
  const group = getGlobalClientsWSGroup();
  if (group[id]) {
    group[id].splice(group[id].indexOf(ws), 1);
  }
};

const sendWebSocket = async (req: Request, groupId: string, type: string, dbData: any) => {
  const group = getGlobalClientsWSGroup();
  const bearerToken = req.headers.authorization;

  // Ariean Jian
  let id = "";
  const token = bearerToken?.split(" ")[1];
  if (token) {
    const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY!);
    const { userId } = decode as IDecodedToken;
    id = userId;
  }

  // const { id } = req.user as IUser;
  const data = {
    updateUserId: id,
    type,
    result: dbData,
  };

  if (group[groupId])
    group[groupId].forEach((clientWS: any) => {
      clientWS.send(JSON.stringify(data));
    });
};

export default {
  sendWebSocket,
  setGlobalClientsWSGroup,
  getGlobalClientsWSGroup,
  setClientWSToGroup,
  removeClientWSFromGroup,
};
