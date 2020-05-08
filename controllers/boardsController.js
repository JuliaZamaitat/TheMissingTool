"use strict";

const Card = require("../models/card");

// Returns all Card that are in our db
exports.getAllCards = (req, res) => {
  Card.find({})
  .exec()
  .then((cards) => {
    res.render("boards/index", {
      cards: cards,
    });
  })
  .catch((error) => {
    console.log(error.message);
    return [];
  })
  .then(() => {
    console.log("promise complete");
  });
};
