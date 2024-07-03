const express = require("express");
const rateLimit = require("express-rate-limit");

const app = express();

// Rate limiter for authentication requests
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 authentication attempts per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message:
    "Too many authentication attempts, please try again later.",
});

// Rate limiter for password reset requests
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 password reset attempts per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message:
    "Too many password reset requests, please try again later.",
});

app.use("/auth", authLimiter);
app.use("/reset-password", passwordResetLimiter);

app.get("/auth", (_, res) => {
  // Simulate an authentication process
  res.send("Authentication successful!");
});

app.post("/reset-password", (_, res) => {
  // Simulate a password reset process
  res.send("Password reset email sent!");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
