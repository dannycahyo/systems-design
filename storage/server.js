const express = require("express");
const fs = require("fs");
const app = express();
app.use(express.json());

// In-memory storage
let inMemoryStorage = {};

// Persistent storage
const persistentStorageFile = "./persistentStorage.json";

// Route for adding data
app.post("/data", (req, res) => {
  const { key, value, type } = req.body;

  if (type === "memory") {
    inMemoryStorage[key] = value;
  } else if (type === "persistent") {
    let data = fs.existsSync(persistentStorageFile)
      ? JSON.parse(fs.readFileSync(persistentStorageFile))
      : {};
    data[key] = value;
    fs.writeFileSync(persistentStorageFile, JSON.stringify(data));
  }

  res.send({ message: "Data added successfully" });
});

// Route for retrieving data
app.get("/data/:key", (req, res) => {
  const { key } = req.params;
  let data = inMemoryStorage[key];
  let source;
  let startTime = Date.now();

  if (data) {
    source = "in-memory";
  } else {
    let persistentData = fs.existsSync(persistentStorageFile)
      ? JSON.parse(fs.readFileSync(persistentStorageFile))
      : {};
    data = persistentData[key];
    source = "persistent storage";
  }

  let endTime = Date.now();
  let timeTaken = endTime - startTime;

  res.send({ data, source, timeTaken });
});

// Route for deleting data
app.delete("/data", (req, res) => {
  const { key, type } = req.body;

  if (type === "memory") {
    // Delete from memory
    delete inMemoryStorage[key];
  } else if (type === "persistent") {
    // Delete from persistent storage
    if (fs.existsSync(persistentStorageFile)) {
      let data = JSON.parse(fs.readFileSync(persistentStorageFile));
      delete data[key];
      fs.writeFileSync(persistentStorageFile, JSON.stringify(data));
    }
  }

  res.send({ message: "Data deleted successfully" });
});

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
