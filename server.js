// inital commit
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const port = 3000;
const User = require("./Schematics/User");
const Post = require("./Schematics/Post");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
require("dotenv").config();
app.use(cors());

const mongoDb = process.env.MONGODB_URI;
const db = mongoose.connection;
db.on("error", (err) => {
  console.log(err);
});
db.once("open", () => {
  console.log("DB Connected.");
});

mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });

// const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

// Middleware for parsing JSON request bodies
app.use(bodyParser.json());

// Set up session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport.js middleware
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Err" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        return done(null, user);
      } else {
        return done(null, false, {
          message: "Incorrect username or password.",
        });
      }
    } catch (err) {
      return done(err);
    }
  })
);
// Serialize and deserialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

app.post("/log-in", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      console.log(info.message);
      return res.status(401).json({ message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      console.log(user);
      return res.status(200).json({ message: "Logged in successfully." });
    });
  })(req, res, next);
});

// Sign Up
app.post("/sign-up", async (req, res, next) => {
  if (req.body.password.length < 6) {
    return res.json("Password must be at least 6 characters");
  }
  bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
    if (err) {
      return next(err);
    }
    const user = new User({
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: hashedPassword,
      dateCreated: new Date(),
      roles: [],
    });
    user
      .save()
      .then(() => {
        res.json("Account created!");
      })
      .catch((err) => {
        next(err);
      });
  });
});

app.post("/create-post", (req, res, next) => {
  const post = new Post({
    postBody: req.body.postBody,
    username: req.body.username,
    dateAdded: new Date(),
  });
  post
    .save()
    .then(() => {
      res.json("Post created!");
    })
    .catch((err) => {
      next(err);
    });
});

app.get("/retrieve-posts", async (req, res) => {
  try {
    const result = await Post.find({}).sort({ $natural: -1 });
    res.json(result);
  } catch (err) {
    res.json(err);
  }
});

// Delete Post
app.delete("/delete-post", async (req, res, next) => {
  try {
    await Post.findByIdAndRemove(req.body.postId);
    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(500);
  }
});

// Endpoint for retrieving user data
app.get("/", (req, res) => {
  res.status(200).json({ status: "success" });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
