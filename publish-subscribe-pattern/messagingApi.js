const axios = require("axios");
const WebSocket = require("ws");

function publish(message, topicId) {
  axios.post(`http://localhost:3001/${topicId}`, message);
}

function subscribe(topicId) {
  return new WebSocket(`ws://localhost:3001/${topicId}`);
}

module.exports = {
  publish,
  subscribe,
};
