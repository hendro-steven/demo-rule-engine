const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
require("dotenv").config({ path: __dirname + "/.env" });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Demo Rules Engine!" });
});

require("./app/routes/rules-engine.route.js")(app);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server run on ${port}`);
});
