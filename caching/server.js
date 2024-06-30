const express = require("express");
const app = express();
const mockDB = require("./database");

// Simple in-memory cache
const cache = {};

app.get("/no-cache", (req, res) => {
  console.log("Fetching without cache...");
  mockDB.get("index.html", (data) => {
    res.send(data);
  });
});

app.get("/with-cache", (req, res) => {
  console.log("Fetching with cache...");
  if (cache["index.html"]) {
    console.log("Returning from cache...");
    return res.send(cache["index.html"]);
  }

  mockDB.get("index.html", (data) => {
    cache["index.html"] = data; // Store data in cache for future requests
    res.send(data);
  });
});

const port = 3000;
app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`),
);
