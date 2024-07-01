const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || "data";

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

app.post("/data", (req, res) => {
  const { key, value } = req.body;
  console.log(`Storing data for key '${key}'`);
  const filePath = path.join(DATA_DIR, key);
  fs.writeFileSync(filePath, value);
  console.log(`Data for key '${key}' stored successfully`);
  res.send({ message: "Data stored successfully" });
});

app.get("/data/:key", (req, res) => {
  const { key } = req.params;
  console.log(`Retrieving data for key '${key}'`);
  const filePath = path.join(DATA_DIR, key);
  if (fs.existsSync(filePath)) {
    const value = fs.readFileSync(filePath, "utf8");
    console.log(`Data for key '${key}' retrieved successfully`);
    res.send({ key, value });
  } else {
    console.log(`Key '${key}' not found`);
    res.status(404).send({ message: "Key not found" });
  }
});

app.listen(PORT, () => {
  console.log(`App server listening on port ${PORT}`);
});
