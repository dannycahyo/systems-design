const axios = require("axios");
const webSocket = require("ws");

function createMessagingWebSocket() {
  return new webSocket("ws://localhost:3001/messages");
}

function getMessages() {
  return axios
    .get("http://localhost:3001/messages")
    .then((response) => response.data);
}

function sendMessage(message) {
  return axios.post("http://localhost:3001/messages", message);
}

module.exports = {
  createMessagingWebSocket,
  getMessages,
  sendMessage,
};
