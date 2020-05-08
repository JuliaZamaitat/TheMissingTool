"use strict";

const mongoose = require("mongoose"),
  Card = require("./models/card");
mongoose.Promise = global.Promise;

mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/board_db",
  { useNewUrlParser: true, useFindAndModify: false }
);

//Create seed Data
Card.deleteMany({}).then(() => {
    return Card.create({
      "backgroundColor": "blue",
      "position": {
        "left": 450,
        "top": 230
      },
      "text": "Ich bin eine tolle Karte",
      "fontSize": 12,
      "shape": "ELLIPSE"
    });
  }).then(card => console.log(card.text)).then(() => {
    return Card.create({
      "backgroundColor": "red",
      "position": {
        "left": 250,
        "top": 130
      },
      "text": "Ich bin eine noch tollere Karte",
      "fontSize": 14,
      "shape": "CIRCLE"
    });
  }).then(card => console.log(card.text)).then(() => {
    return Card.create({
      "backgroundColor": "green",
      "position": {
        "left": 222,
        "top": 123
      },
      "text": "Ich bin die beste Karte",
      "fontSize": 16,
      "shape": "RECTANGLE"
    });
  }).then(card => console.log(card.text)).catch(error => console.log(error.message)).then(() => {
    console.log("DONE");
    mongoose.connection.close();
  });
