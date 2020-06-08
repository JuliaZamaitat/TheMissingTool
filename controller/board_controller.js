const mongoose = require("mongoose"),
	Card = require("../models/card"),
	Board = require("../models/board");


exports.create_board = function (req, res) {
	var newBoard =
		new Board({
			_id: new mongoose.mongo.ObjectId(),
			name: "The coolest board"
		});
	newBoard.save((err) => {
		if (err) {
			console.log("Error creating board");
		} else {
			res.send(newBoard._id);
		}
	});
};

exports.get_board = function (req, res) {
	const filter = {_id: mongoose.Types.ObjectId(req.params.boardId)};
	Board.findOne(filter, (err, savedBoard) => {
		res.render("boards/index", {board: savedBoard});
	});
};

exports.get_linked_board = function (req, res) {
	const filter = {_id: mongoose.Types.ObjectId(req.params.cardId)};
	Card.findOne(filter, (err, savedCard) => {
		res.send(savedCard.linkId);
	});
};

exports.get_cards = function (req, res) {
	const filter = {boardId: mongoose.Types.ObjectId(req.params.boardId)};
	Card.find(filter, (err, cards) => {
		res.send(cards);
	});
};

exports.get_messages = function (req, res) {
	const filter = {_id: mongoose.Types.ObjectId(req.params.boardId)};
	Board.findById(filter, (err, board) => {
		res.send(board.messages);
	});
};


exports.add_link = function (req, res) {
	const filter = {_id: mongoose.Types.ObjectId(req.params.cardId)};
	const update = {linkId: req.query.linkId};

	Card.findOneAndUpdate(filter, update, {new: true},
		function (err) {
			if (err) {
				console.log("Something wrong when updating data!");
			} else {
				res.send("Successfully created link");
			}
		}
	);
};
