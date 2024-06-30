const express = require("express");
const app = express();
const db = require("./database");
const redis = require("redis").createClient({
  url: "redis://127.0.0.1:6379",
});

redis.connect().catch(console.error);

app.get("/no-cache/index.html", (req, res) => {
  console.log("Fetching without cache...");
  db.get("index.html", (page) => {
    res.send(page);
  });
});

app.get("/with-cache/index.html", async (req, res) => {
  console.log("Fetching with cache...");
  const redisResponse = await redis.get("index.html");
  if (redisResponse) {
    console.log("Returning from cache...");
    return res.send(redisResponse);
  }

  db.get("index.html", async (data) => {
    console.log("Returning from database...");
    await redis.set("index.html", data, {
      EX: 10, // Cache data for 10 seconds
    });
    res.send(data);
  });
});

const port = 3000;
app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`),
);
