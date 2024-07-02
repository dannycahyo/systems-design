const express = require("express");
const expressWebSocket = require("express-ws");

const app = express();
expressWebSocket(app);

const messages = [
  { id: 0, text: "Welcome to the chat!", username: "Chatbot" },
];
const sockets = [];

app.use(express.json());

app.listen(3001, () => {
  console.log("Server started on http://localhost:3001");
});

app.get("/messages", (_, res) => {
  res.json(messages);
});

app.post("/messages", (req, res) => {
  const message = req.body;
  messages.push(message);
  sockets.forEach((socket) => socket.send(JSON.stringify(message)));
  res.json(message);
});

app.ws("/messages", (ws) => {
  sockets.push(ws);
  ws.on("close", () => {
    sockets.splice(sockets.indexOf(ws), 1);
  });
});
