const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

const PORT = 8000;
const app = express();

const APP_ID = "bfca05642cd54e18bac76fe16727eb02";
const APP_CERTIFICATE = "996c157f17ea44bdb5a792b93566c767";
let TOKEN = null;
let CHANNEL = null;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname + "/public")));

app.get("/", (req, res) => {
  res.render("lobby.ejs");
});

app.get("/lobby.ejs", (req, res) => {
  res.render("lobby.ejs");
});

app.get("/room.ejs", (req, res) => {
  res.render("room.ejs");
});

app.get("/:roomId", function (req, res) {
  res.render("room.ejs", {
    APP_ID: APP_ID,
    CHANNEL: req.params.roomId,
    TOKEN: TOKEN,
    USERNAME: USERNAME,
  });
});

app.post("/", (req, res) => {
  CHANNEL = req.body.channelName;
  USERNAME = req.body.userName;
  let uid = 0;
  let role = RtcRole.PUBLISHER;
  let expireTime = 7200;
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    CHANNEL,
    uid,
    role,
    privilegeExpireTime
  );
  TOKEN = token;

  res.redirect("/" + req.body.channelName);
});

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
