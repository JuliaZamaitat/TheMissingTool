const mongoose = require("mongoose"),
	Card = require("./models/card"),
	Board = require("./models/board");
var users = {};

module.exports = {
	start: function (io) {
		io.on("connection", function (socket) {
			let board;
			console.log("a user connected with id %s", socket.id);

			socket.on("join", function (obj) {
				let username = obj.name;
				socket.user = username;
				let room = obj.boardId;
				socket.join(room);
				board = room;

				if (!(board in users)) {
					users[board] = [];
				}
				if(!users[board].includes(username)) {
					users[board].push(username);
				}
				console.log(users);

				io.to(board).emit("update-users", users[board]);

			});

			socket.on("disconnect", function () {
				refreshUserNameList()
			});

			socket.on("change-user-list", function () {
				refreshUserNameList()
			});

			function refreshUserNameList() {
				if (users[board] != null){
					const currentUsers = Object.values(users[board]);
					for (var i=0; i<currentUsers.length; i++){
						if (currentUsers[i] == socket.user) {
							currentUsers.splice(i,1);
							users[board] = currentUsers;
						}
					}
					io.to(board).emit("update-users", users[board]);
				}
			}

			socket.on("add-link", function (incoming) {
				const filter = {_id: mongoose.Types.ObjectId(incoming.cardId)};
				const update = {linkId: incoming.linkId};

				Card.findOneAndUpdate(filter, update, {new: true},
					function (err) {
						if (err) {
							console.log("Something wrong when updating data!");
						} else {
							io.to(board).emit("card-to-link", incoming.cardId);
						}
					}
				);
			});

			socket.on("move-card", function (incoming) {
				const filter = {_id: mongoose.Types.ObjectId(incoming.cardId)};
				const update = {boardId: incoming.boardId};

				Card.findOneAndUpdate(filter, update, {new: true},
					function (err) {
						if (err) {
							console.log("Something wrong when updating data!");
						} else {
							Card.findById(incoming.cardId, function (err, card) {
								if (err) console.log("Error finding card by id");
								io.to(incoming.boardId).emit("display-card", card);
								io.to(board).emit("remove-card", card.id);
							});

						}
					}
				);
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
						type: req.type,
						linkId: req.linkId,
						shape: req.shape
					});

				card.save((err) => {
					if (err) {
						console.log("Something wrong saving card");
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

			socket.on("update-color", function(req) {
				const filter = {_id: mongoose.Types.ObjectId(req._id)};
				const update = {backgroundColor: req.backgroundColor};

				Card.findOneAndUpdate(filter, update, {new: true},
					function (err) {
						if (err) {
							console.log("Something wrong when updating data!");
						}
						io.to(board).emit("color-update", JSON.stringify({
							_id: req._id,
							backgroundColor: req.backgroundColor,
							shape: req.shape
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

			socket.on("message", function (message) {

				const filter = {_id: mongoose.Types.ObjectId(message.boardId)};
				Board.findOneAndUpdate(
					filter,
					{$push: {messages: message}},
					function (error) {
						if (error) {
							console.log("Something went wrong adding message to board");
						}
					});
				io.to(board).emit("message", message);
			});

			socket.on("comment", function (commentData) {
				const comment = {
					sender: commentData.sender,
					message: commentData.message,
					timestamp: Date.now()
				};

				const filter = {_id: mongoose.Types.ObjectId(commentData.cardId)};

				Card.findOneAndUpdate(
					filter,
					{$push: {comments: comment}},
					function (error, success) {
						if (error) {
							console.log(error);
						} else {
							console.log(success);
						}
					});

				io.to(board).emit("comment", {
					sender: comment.sender,
					message: comment.message,
					timestamp: comment.timestamp,
					cardId: commentData.cardId
				});
			});

			socket.on("typing", (data) => {
				if(data.typing==true)
					socket.broadcast.emit("display", data);
				else
					socket.broadcast.emit("display", data);
			});

		});
	}
};
