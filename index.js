const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai')
const PORT = 8000;
const app = express();


const APP_ID = "bfca05642cd54e18bac76fe16727eb02";
const APP_CERTIFICATE = "996c157f17ea44bdb5a792b93566c767";
let TOKEN = null;
let CHANNEL = null;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname + "/public")));
app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

const configuration = new Configuration({
  apiKey: "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",
});

const openai = new OpenAIApi(configuration);


app.get("/", (req, res) => {
  res.render("landingPage.ejs");
});

app.get("/lobby.ejs", (req, res) => {
  res.render("lobby.ejs");
});

app.get("/room.ejs", (req, res) => {
  res.render("room.ejs");
});

app.get("/gpt.ejs", (req, res) => {
  res.render("gpt.ejs");
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

app.post('/api/openai', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${prompt}`,
      temperature: 0, // Higher values means the model will take more risks.
      max_tokens: 3000, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
      top_p: 1, // alternative to sampling with temperature, called nucleus sampling
      frequency_penalty: 0.5, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
      presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
    });

    res.status(200).send({
      bot: response.data.choices[0].text
    });

  } catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong');
  }
})

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
