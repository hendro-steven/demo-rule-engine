module.exports = (app) => {
  const engine = require("../controllers/rules-engine.controller");

  app.post("/engine/simple", engine.simple);
  app.post("/engine/player", engine.player);
  app.post("/engine/advance", engine.advance);
  app.post("/engine/instapay", engine.instaPayEligibility);
};
