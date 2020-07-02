const mongoose = require("mongoose"),
	cardSchema = mongoose.Schema({
		_id: mongoose.ObjectId,
		backgroundColor: String,
		position: {
			left: Number,
			top: Number
		},
		size: {
			width: String,
			height: String
		},
		text: String,
		fontSize: Number,
		shape: {
			type: String,
			enum: ["SQUARE", "RECTANGLE", "CIRCLE", "TRIANGLE", "ELLIPSE"],
			default: "SQUARE"
		},
		boardId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Board"
		},
		comments: [{sender: String, message: String, timestamp : Date}],
		linkId: {
			type: mongoose.Schema.Types.ObjectId,
			default: null
		}
	});

module.exports = mongoose.model("Card", cardSchema);
