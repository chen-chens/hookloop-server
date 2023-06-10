import { Request } from "express";

import { IUser } from "@/models/userModel";

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

const sendWebSocket = (req: Request, groupId: string, type: string, dbData: any) => {
  const group = getGlobalClientsWSGroup();
  const { id } = req.user as IUser;
  const data = {
    updateUserId: id,
    type,
    ...dbData,
  };
  if (group[groupId])
    group[groupId].forEach((clientWS: any) => {
      clientWS.send(
        JSON.stringify({
          data,
        }),
      );
    });
};

export default {
  sendWebSocket,
  setGlobalClientsWSGroup,
  getGlobalClientsWSGroup,
  setClientWSToGroup,
  removeClientWSFromGroup,
};
