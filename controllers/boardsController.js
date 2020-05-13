"use strict";

const app = require("../main");
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Card = require("../models/card");

io.on('connection', () => {
    console.log('A new user is connected')

});

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

exports.get_card = (req, res) => {
  Card.find({},(err, card)=> {
    res.send(card);
  })
};

exports.save_card =(req, res) => {
  const card = new Card(
      {
        backgroundColor: req.body.color,
        position: {
          left: null,
          top: null
        },
        text: null,
        fontSize: 24
      }
  );

  card.save((err) =>{
    if(err)
        io.emit('message', card);
        res.sendStatus(200);

  })
};





