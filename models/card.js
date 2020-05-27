const mongoose = require("mongoose"),
    cardSchema = mongoose.Schema({
        _id: mongoose.ObjectId,
        backgroundColor: String,
        position: {
            left: Number,
            top: Number
        },
        text: String,
        fontSize: Number,
        shape: {
            type: String,
            enum: ["RECTANGLE", "CIRCLE", "TRIANGLE", "ELLIPSE"],
            default: "RECTANGLE"
        },
        boardId: [{type: mongoose.ObjectId, ref: "Board"}]
    });

module.exports = mongoose.model("Card", cardSchema);
