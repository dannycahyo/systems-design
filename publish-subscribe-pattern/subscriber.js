const messagingApi = require("./messagingApi");

const TOPIC_ID = process.env.TOPIC_ID || "general";

function displayMessage(message) {
  console.log(`> ${message.name}: ${message.text}`);
}

function streamMessage() {
  const ws = messagingApi.subscribe(TOPIC_ID);

  ws.on("message", (data) => {
    const message = JSON.parse(data);
    displayMessage(message);
  });
}

streamMessage();
