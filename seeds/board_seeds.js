"use strict";

const mongoose = require("mongoose"),
	Card = require("../models/card"),
	Board = require("../models/board");


mongoose.connect(
	process.env.MONGODB_URI || "mongodb://localhost:27017/board_db",
	{useNewUrlParser: true, useFindAndModify: false}
);

Board.deleteMany({}).then(() => {
	return Board.create({
		"_id": new mongoose.Types.ObjectId("56cb91bdc3464f14678934ca"),
		"name": "Cooles Board"
	})
		.then(board => {
			this.id = board._id;
			console.log(board.name + " " + board._id);
		})
		.then(() => {
			return Card.deleteMany({})
				.then(() => {
					return Card.create({
						"_id": new mongoose.Types.ObjectId("32cb31bde3464f14678934ca"),
						"backgroundColor": "blue",
						"position": {
							"left": 450,
							"top": 230
						},
						"text": "Ich bin eine tolle Karte",
						"fontSize": 12,
						"shape": "ELLIPSE",
						"boardId": this.id
					});
				}).then(card => console.log(card.boardId)).then(() => {
					return Card.create({
						"_id": new mongoose.Types.ObjectId("22cb32bde3464f14678922ca"),
						"backgroundColor": "red",
						"position": {
							"left": 250,
							"top": 130
						},
						"text": "Ich bin eine noch tollere Karte",
						"fontSize": 14,
						"shape": "CIRCLE",
						"boardId": this.id
					});
				}).then(card => console.log(card.text));
		}).then(() => {
			console.log("DONE");
			mongoose.connection.close();
		});
});
