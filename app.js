//jshint esversion:6
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const shortId = require("shortid");
const app = express();

mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const shortUrlSchema = new mongoose.Schema({
  full: { type: String },
  short: { type: String, default: shortId.generate },
  clicks: { type: Number, default: 0 },
});

const ShortUrl = mongoose.model("ShortUrl", shortUrlSchema);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
  const shortUrls = await ShortUrl.find();
  res.render("index", { shortUrls: shortUrls });
});

app.post("/", async (req, res) => {
  await ShortUrl.create({ full: req.body.fullUrl });

  res.redirect("/");
});

app.post("/searchurl", async (req, res) => {
  const search = req.body.url;
  const shortUrls = await ShortUrl.findOne({ full: search });
  if (shortUrls === null || shortUrls === "") {
    res.render("error");
  } else res.render("search", { shortUrls: shortUrls });
});

app.get("/:shortUrl", async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
  if (shortUrl == null) return res.sendStatus(404);

  shortUrl.clicks++;
  shortUrl.save();

  res.redirect(shortUrl.full);
});

let port = process.env.PORT;
if ((port == null) | (port == "")) {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started on port 3000.");
});
