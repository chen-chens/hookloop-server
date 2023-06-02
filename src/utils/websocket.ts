let clients: any = {};
function setClients(newClients: any) {
  clients = newClients;
}
function getClients() {
  return clients;
}

const sendWebSocket = (id: string, type: string, data: any) => {
  const clientsId = getClients();
  if (clientsId[id])
    clientsId[id].forEach((client: any) => {
      client.send(
        JSON.stringify({
          type,
          data,
        }),
      );
    });
};
export default { sendWebSocket, setClients, getClients };
