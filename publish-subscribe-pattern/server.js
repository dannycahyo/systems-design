const express = require("express");
const expressWebSocket = require("express-ws");

const app = express();
expressWebSocket(app);

app.use(express.json());

app.listen(3001, () => {
  console.log("Server started on http://localhost:3001");
});

const sockets = [];

app.post("/:topicId", (req, res) => {
  const { topicId } = req.params;

  const message = req.body;

  const topicSockets = sockets[topicId] || [];
  topicSockets.forEach((socket) =>
    socket.send(JSON.stringify(message)),
  );
});

app.ws("/:topicId", (ws, req) => {
  const { topicId } = req.params;

  sockets[topicId] = sockets[topicId] || [];
  sockets[topicId].push(ws);

  ws.on("close", () => {
    sockets[topicId].splice(sockets[topicId].indexOf(ws), 1);
  });
});
