const mongoose = require("mongoose"),
  cardSchema = mongoose.Schema ({
    "backgroundColor": String,
    "position": {
      "left": Number,
      "top": Number
    },
    "text": String,
    "fontSize": Number,
    "shape": {
      type: String,
      enum: ["RECTANGLE", "CIRCLE", "TRIANGLE", "ELLIPSE"],
      default: "RECTANGLE"
    }
    // TODO LATER "boardId": [{type: mongoose.Schema.Types.ObjectId, ref:"Board"}]
  })


  module.exports = mongoose.model("Card", cardSchema); //Exports the model
