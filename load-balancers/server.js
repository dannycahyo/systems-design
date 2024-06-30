const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend service running on http://localhost:${PORT}`);
});

app.get("/api/data", (req, res) => {
  console.log(req.headers);
  res.json({ message: "This is data from the backend service." });
});
