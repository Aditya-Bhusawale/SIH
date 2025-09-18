const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const path = require("path");
const User = require("./models/User");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("public"));

// Sessions
app.use(
  session({
    secret: "mysecretkey", // change this to something secure
    resave: false,
    saveUninitialized: false,
  })
);

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/loginDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware to protect routes
function isAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
}

// ---------------- ROUTES ---------------- //

// Public home (landing) page
app.get("/", (req, res) => {
  res.render("home.ejs"); // create views/landing.ejs
});

app.get("/home", (req, res) => {
    res.render("home", { user: req.session.user });
});


// Protected routes
app.get("/path", isAuth, (req, res) => {
  res.render("path.ejs");
});



app.get("/tracker", isAuth, (req, res) => {
  res.render("tracker.ejs");
});

app.get("/quizz", isAuth, (req, res) => {
  res.render("quizz.ejs");
});

app.get("/ai", isAuth, (req, res) => {
  res.render("ai.ejs");
});

app.get("/college", isAuth, (req, res) => {
  res.render("college.ejs");
});

app.get("/recommended", isAuth, (req, res) => {
  res.render("recommended.ejs");
});

// Auth routes
app.get("/login", (req, res) => {
  res.render("users/login");
});

app.get("/signup", (req, res) => {
  res.render("users/signup");
});

app.get("/home", isAuth, (req, res) => {
  const user = req.session.user; // get user from session
  res.render("home", {
    username: user.username,
    email: user.email,
    role: user.role || "Student",
    college: user.college || "ABC College",
  });
});

// Signup Route
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: "Student", // default role
      college: "ABC College", // default college
    });
    await newUser.save();
    req.session.user = newUser; // store user in session
    res.redirect("/home");
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials");

    req.session.user = user; // save user session
    res.redirect("/home");
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

// Logout Route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect("/login");
  });
});

app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);