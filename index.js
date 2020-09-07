const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
var helmet = require("helmet");
var RateLimit = require("express-rate-limit");
var MongoStore = require("rate-limit-mongo");

const powerupManager = require("./jobs/powerups");
powerupManager.start();
const cooldownManager = require("./jobs/cooldown");
cooldownManager.start();

const authRoute = require("./routes/auth");
const dashRoute = require("./routes/dashboard");
const boardRoute = require("./routes/leaderboard");
const admin = require("./routes/admin");
const questionRoute = require("./routes/questions");
const shopRoute = require("./routes/shop");

const attackRoute = require("./controllers/attack");
const makerRoute = require("./controllers/questionMaker");
const buyRoute = require("./controllers/buy");
const defRoute = require("./controllers/defense");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const contentSecurity = require("./middleware/contentSecurity");

const port = 5000 || process.env.PORT;

require("dotenv").config();

mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
  () => {
    console.log("connected to db");
  }
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json());
app.use(helmet());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

var limiter = new RateLimit({
  store: new MongoStore({
    uri: process.env.MONGO_URI,
    expireTimeMs: 60 * 1000 * 60,
  }),
  max: 150,
  windowMs: 10 * 60 * 1000,
  message: "Too many requests in a short duration, IP Banned for an hour.",
});

app.use("/",limiter, authRoute);
app.use("/", dashRoute);
app.use("/", boardRoute);
app.use("/", attackRoute);
app.use("/", makerRoute);
app.use("/", admin);
app.use("/",limiter, questionRoute);
app.use("/", shopRoute);
app.use("/",limiter, buyRoute);
app.use("/", defRoute);

app.get("/", contentSecurity, (req, res) => {
  res.render("index.ejs", { active: "home" });
});

app.get("/register", limiter, contentSecurity, (req, res) => {
  res.render("register.ejs", { active: "register" });
});

app.get("/login", contentSecurity, (req, res) => {
  res.render("login.ejs", { active: "login" });
});

app.get("*", contentSecurity, function (req, res) {
  res.status(404).render("404.ejs");
});

app.listen(port, () => console.log(`running on port ${port}`));
