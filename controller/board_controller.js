const mongoose = require("mongoose"),
	Card = require("../models/card_model"),
	Board = require("../models/board_model");

// Boards
exports.createBoard = function (req, res) {
	const newBoard =
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

exports.createChildBoard = function (req, res) {
	const parentBoardId = req.params.boardId;

	Board.findById(parentBoardId, (err, parentBoard) => {
		const newPath = parentBoard.path;
		newPath.push(parentBoardId);
		const newBoard =
			new Board({
				_id: new mongoose.mongo.ObjectId(),
				name: req.body.name,
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

exports.getPath = function (req, res) {
	const filter = {_id: mongoose.Types.ObjectId(req.params.boardId)};
	Board.findOne(filter, (err, savedBoard) => {
		res.send(savedBoard.path);
	});
};

exports.getBoard = function (req, res) {
	const filter = {_id: mongoose.Types.ObjectId(req.params.boardId)};
	Board.findOne(filter, (err, savedBoard) => {
		if (savedBoard == null) {
			res.render("error.ejs");
		} else {
			res.render("boards/index", {board: savedBoard});
		}
	});
};

exports.getBoardData = function (req, res) {
	const filter = {_id: mongoose.Types.ObjectId(req.params.boardId)};
	Board.findOne(filter, (err, savedBoard) => {
		res.send(savedBoard);
	});
};

exports.getMessages = function (req, res) {
	const filter = {_id: mongoose.Types.ObjectId(req.params.boardId)};
	Board.findById(filter, (err, board) => {
		res.send(board.messages);
	});
};

exports.getConnectors = function (req, res) {
	const filter = {_id: mongoose.Types.ObjectId(req.params.boardId)};
	Board.findById(filter, (err, board) => {
		res.send(board.connectors);
	});
};

// Cards
exports.getLinkedBoard = function (req, res) {
	const filter = {_id: mongoose.Types.ObjectId(req.params.cardId)};
	Card.findOne(filter, (err, savedCard) => {
		res.send(savedCard.linkId);
	});
};

exports.getCards = function (req, res) {
	const filter = {boardId: mongoose.Types.ObjectId(req.params.boardId)};
	Card.find(filter, (err, cards) => {
		res.send(cards);
	});
};
