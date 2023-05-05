// inital commit
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
const port = 3000;
app.use(cors());
const users = [];

// Middleware for parsing JSON request bodies
app.use(bodyParser.json());

// Endpoint for creating a new user
app.post("/create-user", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }
  const user = { id: users.length + 1, username, password };
  users.push(user);
  res.status(201).json({ message: "User created successfully", user });
});

// Endpoint for deleting a user
app.delete("/delete-user/:id", authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }
  users.splice(index, 1);
  res.status(200).json({ message: "User deleted successfully" });
});

// Endpoint for retrieving user data
app.get("/user", authenticateToken, (req, res) => {
  res.status(200).json({ user: req.user });
});

app.get("/", (req, res) => {
  res.status(200).json({ status: "success" });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Authentication token is missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Authentication token is invalid" });
    }
    req.user = user;
    next();
  });
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
