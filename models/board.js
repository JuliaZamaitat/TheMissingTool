var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const boardSchema = new Schema({
	_id: mongoose.ObjectId,
	name: {type: String, required: false, max: 200},
	path: [mongoose.ObjectId],
	messages: [{text: String, time: Date, username : String}],
	connectors: [{from: String, to: String}]
});

module.exports = mongoose.model("Board", boardSchema);
