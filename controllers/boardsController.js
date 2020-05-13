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

exports.save_card = (req, res) => {
  console.log("In controller");
  console.log(req.body);

  /*
  * exports.saveCard = (req, res) => {
  *
  var card = new Card(req.body);
  message.save((err) =>{
    if(err)
      sendStatus(500);
    io.emit('message', req.body);
    res.sendStatus(200);
  })
})*/
};


