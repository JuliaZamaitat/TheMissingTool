const mongoose = require("mongoose"),
	Card = require("./models/card"),
	Board = require("./models/board");

module.exports = {
	start: function (io) {
		io.on("connection", function (socket) {
			let board;
			console.log("a user connected with id %s", socket.id);

			socket.on("join", function (room) {
				socket.join(room);
				board = room;
				console.log(socket.id, "joined", room);
			});

			socket.on("save-card", function (req) {
				const card = new Card(
					{
						_id: new mongoose.mongo.ObjectId(),
						backgroundColor: req.color,
						position: {
							left: null,
							top: null
						},
						boardId: mongoose.Types.ObjectId(board),
						type: req.type
					});
				card.save((err) => {
					if (err) {
						console.log("Something wrong saving card");
					} else {
						console.log(card._id, card.boardId);
					}
					io.to(board).emit("new-card", JSON.stringify(card));
				});
			});

			socket.on("update-pos", function (req) {
				const filter = {_id: mongoose.Types.ObjectId(req._id)};
				const update = {position: {left: req.position.left, top: req.position.top}};

				Card.findOneAndUpdate(filter, update, {new: true},
					function (err) {
						if (err) {
							console.log("Something wrong when updating data!");
						}
						io.to(board).emit("pos-update", JSON.stringify({
							_id: req._id,
							position: {
								left: req.position.left,
								top: req.position.top
							}
						}));
					}
				);
			});

			socket.on("delete-card", function (req) {
				const filter = {_id: mongoose.Types.ObjectId(req._id)};

				Card.deleteOne(filter,
					function (err) {
						if (err) {
							console.log("Something wrong when deleting data!");
						}
						io.to(board).emit("delete-card", JSON.stringify({
							_id: req._id
						}));
					}
				);
			});

			socket.on("update-text", function (req) {
				const filter = {_id: mongoose.Types.ObjectId(req._id)};
				const update = {text: req.text};

				Card.findOneAndUpdate(filter, update, {new: true},
					function (err) {
						if (err) {
							console.log("Something wrong when updating data!");
						}
						socket.broadcast.to(board).emit("text-update", JSON.stringify({
							_id: req._id,
							text: req.text
						}));
					}
				);
			});

			socket.on("update-board-name", function (req) {
				const filter = {_id: mongoose.Types.ObjectId(req._id)};
				const update = {name: req.name};

				Board.findOneAndUpdate(filter, update, {new: true},
					function (err) {
						if (err) {
							console.log("Something wrong when updating board!");
						}
						io.to(board).emit("board-name-update", JSON.stringify({
							name: req.name
						}));
					}
				);
			});

			socket.on("delete-board", function (req) {
				const card_filter = {boardId: mongoose.Types.ObjectId(req._id)};
				const board_filter = {_id: mongoose.Types.ObjectId(req._id)};

				Card.deleteMany(card_filter, function (err) {
					if (err) {
						console.log("Cannot delete the cards in this board");
					}
				});

				Board.deleteOne(board_filter, function (err) {
					if (err) {
						console.log("Cannot delete this board");
					}
					io.to(board).emit("board-deleted");
				});
			});

		});
	}
};
