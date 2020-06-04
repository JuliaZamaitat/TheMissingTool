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
		boardId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Board"
		},
		comments: [{sender: String, message: String, timestamp : Date}],
		linkId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Board"
		},
		type: {
			type: String,
			enum: ["LINK", "NORMAL"],
			default: "NORMAL"
		},
	});

module.exports = mongoose.model("Card", cardSchema);
