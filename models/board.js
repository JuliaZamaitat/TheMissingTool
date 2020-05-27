var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const boardSchema = new Schema({
    _id: mongoose.ObjectId,
    name: {type: String, required: true, max: 200}
});

module.exports = mongoose.model("Board", boardSchema);
