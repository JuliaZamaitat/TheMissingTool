var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const boardSchema = new Schema({
	_id: mongoose.ObjectId,
	name: {type: String, required: false, max: 200},
	messages: [{text: String, time: Date, username : String}],
});

module.exports = mongoose.model("Board", boardSchema);
