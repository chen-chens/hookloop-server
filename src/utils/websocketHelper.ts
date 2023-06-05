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

const sendWebSocket = (id: string, type: string, data: any) => {
  const group = getGlobalClientsWSGroup();
  if (group[id])
    group[id].forEach((clientWS: any) => {
      clientWS.send(
        JSON.stringify({
          type,
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
