const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const SHARD_ADDRESSES = [
  "http://localhost:3001",
  "http://localhost:3002",
];

const getShardAddress = (key) => {
  const hash = key
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return SHARD_ADDRESSES[hash % SHARD_ADDRESSES.length];
};

app.use("/data/:key?", async (req, res) => {
  const key = req.method === "POST" ? req.body.key : req.params.key;
  if (!key) {
    console.log("Request received without a key.");
    return res.status(400).send({ message: "Key is required" });
  }
  const shardAddress = getShardAddress(key);
  console.log(
    `Forwarding ${req.method} request for key '${key}' to ${shardAddress}`,
  );
  try {
    const response = await axios({
      method: req.method.toLowerCase(),
      url: `${shardAddress}${req.originalUrl}`,
      data: req.method === "POST" ? req.body : undefined,
    });
    res.send(response.data);
  } catch (error) {
    console.error(
      `Error forwarding request for key '${key}' to ${shardAddress}: ${error}`,
    );
    res.status(500).send({ message: "Error forwarding request" });
  }
});

app.listen(8080, () => {
  console.log(`Proxy server listening on port 8080`);
});
