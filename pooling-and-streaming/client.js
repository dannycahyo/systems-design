const { getRandomInt } = require("./utils");
const messagingApi = require("./messaging_api");
const readline = require("readline");

const displayedMessages = {};

const terminal = readline.createInterface({
  input: process.stdin,
});

terminal.on("line", (text) => {
  const username = process.env.NAME;
  const id = getRandomInt(1, 100000);
  displayedMessages[id] = true;

  const message = { id, text, username };
  messagingApi.sendMessage(message);
});

function displayMessage(message) {
  console.log(`> ${message.username}: ${message.text}`);
  displayedMessages[message.id] = true;
}

async function getAndDisplayMessages() {
  const messages = await messagingApi.getMessages();
  messages.forEach((message) => {
    if (!displayedMessages[message.id]) {
      displayMessage(message);
    }
  });
}

function pollMessages() {
  setInterval(getAndDisplayMessages, 3000);
}

function streamMessages() {
  const ws = messagingApi.createMessagingWebSocket();

  ws.on("message", (data) => {
    const message = JSON.parse(data);
    if (!displayedMessages[message.id]) {
      displayMessage(message);
    }
  });
}

if (process.env.MODE === "stream") {
  getAndDisplayMessages();
  streamMessages();
} else if (process.env.MODE === "poll") {
  getAndDisplayMessages();
  pollMessages();
}
