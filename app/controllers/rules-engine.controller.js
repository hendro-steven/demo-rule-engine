const { Engine, Rule } = require("json-rules-engine");
const api = require("../utils/api-client");
const instapayRules = require("../rules/instapay.json");

exports.simple = (req, res) => {
  let engine = new Engine();
  engine.addRule({
    conditions: {
      all: [
        {
          fact: "age",
          operator: "equal",
          value: 20,
        },
      ],
    },
    onSuccess() {
      res.status(200).send({
        message: "Success called",
      });
    },
    onFailure() {
      res.status(200).send({
        message: "Failure called",
      });
    },
    event: {
      type: "message",
      params: { data: "simple-rules-engine!" },
    },
  });
  const facts = { age: req.body.age };
  engine
    .run(facts)
    .then((results) => {
      results.events.map((event) => console.log("value", event.params.data));
    })
    .catch((error) => console.log(error));
};

exports.player = (req, res) => {
  let engine = new Engine();

  // define a rule for detecting the player has exceeded foul limits.  Foul out any player who:
  // (has committed 5 fouls AND game is 40 minutes) OR (has committed 6 fouls AND game is 48 minutes)
  engine.addRule({
    conditions: {
      any: [
        {
          all: [
            {
              fact: "gameDuration",
              operator: "equal",
              value: 40,
            },
            {
              fact: "personalFoulCount",
              operator: "greaterThanInclusive",
              value: 5,
            },
          ],
        },
        {
          all: [
            {
              fact: "gameDuration",
              operator: "equal",
              value: 48,
            },
            {
              fact: "personalFoulCount",
              operator: "greaterThanInclusive",
              value: 6,
            },
          ],
        },
      ],
    },
    onFailure() {
      res.status(200).send({
        message: "No criteria met",
      });
    },
    // define the event to fire when the conditions evaluate truthy
    event: {
      type: "fouledOut",
      params: { data: "Player has fouled out!" },
    },
  });

  const facts = {
    personalFoulCount: req.body.personalFoulCount,
    gameDuration: req.body.gameDuration,
  };

  engine
    .run(facts)
    .then((results) => {
      results.events.map((event) => {
        console.log(event.type);
        res.status(200).send({
          message: event.params.data,
        });
      });
    })
    .catch((error) => console.log(error));
};

exports.advance = (req, res) => {
  let engine = new Engine();

  let microsoftRule = {
    conditions: {
      all: [
        {
          fact: "account-information",
          operator: "equal",
          value: "microsoft",
          path: "$.company",
        },
        {
          fact: "account-information",
          operator: "in",
          value: ["active", "paid-leave"],
          path: "$.status",
        },
        {
          fact: "account-information",
          operator: "contains",
          value: "2016-12-25",
          path: "$.ptoDaysTaken",
        },
      ],
    },
    event: {
      type: "microsoft-christmas-pto",
      params: {
        message: "current microsoft employee taking christmas day off",
      },
    },
  };
  engine.addRule(microsoftRule);
  engine.addFact("account-information", function (params, almanac) {
    return almanac.factValue("accountId").then((accountId) => {
      return api.getAccountInformation(accountId);
    });
  });

  let facts = { accountId: req.body.accountId };

  engine.run(facts).then((results) => {
    results.events.map((event) => {
      res.status(200).send({
        message: facts.accountId + " is a " + event.params.message,
      });
    });
  });
};

exports.instaPayEligibility = (req, res) => {
  let rule = new Rule(instapayRules.decisions);
  let engine = new Engine();
  engine.addRule(rule);

  //can come from input param, db result, api/grpc
  const facts = {
    balance: req.body.balance,
    org: req.body.org,
  };

  engine.on("success", (event, almanac, ruleResult) => {
    res.status(200).send({
      message: event.params.message,
    });
  });

  engine.on("failure", (event, almanac, ruleResult) => {
    res.status(200).send({
      message: "User not eligible for Instapay",
    });
  });

  engine.run(facts);
};
