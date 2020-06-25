const mongoose = require("mongoose"),
	Card = require("../models/card"),
	Board = require("../models/board");

exports.create_board = function (req, res) {
	var newBoard =
		new Board({
			_id: new mongoose.mongo.ObjectId(),
			name: ""
		});
	newBoard.save((err) => {
		if (err) {
			console.log("Error creating board");
		} else {
			res.send(newBoard._id);
		}
	});
};

exports.create_child_board = function (req, res) {

	let parentBoardId = req.params.boardId;

	Board.findById(parentBoardId, (err, parentBoard) => {
		const newPath = parentBoard.path;
		newPath.push(parentBoardId);
		const newBoard =
			new Board({
				_id: new mongoose.mongo.ObjectId(),
				name: "",
				path: newPath
			});
		newBoard.save((err) => {
			if (err) {
				console.log("Error creating board");
			} else {
				res.send(newBoard._id);
			}
		});
	});
};

exports.get_path = function (req, res) {
	const filter = {_id: mongoose.Types.ObjectId(req.params.boardId)};
	Board.findOne(filter, (err, savedBoard) => {
		res.send(savedBoard.path);
	});
};

exports.get_board = function (req, res) {
	const filter = {_id: mongoose.Types.ObjectId(req.params.boardId)};
	Board.findOne(filter, (err, savedBoard) => {
		res.render("boards/index", {board: savedBoard});
	});
};

exports.get_board_data = function (req, res) {
	const filter = {_id: mongoose.Types.ObjectId(req.params.boardId)};
	Board.findOne(filter, (err, savedBoard) => {
		res.send(savedBoard);
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
