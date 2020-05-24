var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const boardSchema = new Schema({
    _id: Number,
    name: {type: String, required: true, max: 200}
});

module.exports = mongoose.model("Board", boardSchema);
