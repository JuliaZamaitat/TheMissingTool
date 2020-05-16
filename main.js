"use strict";

//Require the necessary modules
const express = require("express"),
	app = express(),
	layouts = require("express-ejs-layouts"),
	mongoose = require("mongoose"),
	bodyParser = require("body-parser"),
	http = require("http"),
	server = http.createServer(app),
	io = require("socket.io").listen(server),
	Card = require("./models/card");

//Connects either to the procution database, docker db or our local database
mongoose.connect(
	process.env.MONGODB_URI || "mongodb://localhost:27017/board_db",
	{ useNewUrlParser: true, useFindAndModify: false }
);

//Get a db instance to work with
const db = mongoose.connection;

//Notfication when connection to db was successfull
db.once("open", () => {
	console.log("Connected to MongoDB");
});

//In order to parse JSON for our application
app.use(
	express.urlencoded({
		extended: true
	})
);
app.use(express.json());

//Tell node to use layouts and to look in the public folder for static files
app.use(layouts);
app.use(express.static("public"));

//Sets the necessary variables
app.set("view engine", "ejs");

app.set("port", process.env.NODEPORT || 8081);
app.use(bodyParser.json());

//Start listening to the PORT
app.listen(app.get("port"), () => {
	console.log(`Server running at http://localhost:${app.get("port")}`);
});


io.on("connection", () => {
	console.log("A new user is connected");
});

// Routes
app.get("/", get_cards);
app.get("/data", get_cards_data);
app.post("/update-pos", update_card);
app.post("/", save_card);

// Controller
// TODO: export with socket.io
function save_card(req, res) {
	const card = new Card(
		{
			_id: new mongoose.mongo.ObjectId(),
			backgroundColor: req.body.color,
			position: {
				left: null,
				top: null
			}
		});
	card.save((err) => {
		if (err)
			res.sendStatus(500);
		io.emit("new-card", JSON.stringify(card));
		res.sendStatus(200);

	});
}

function get_cards_data (req, res) {
	Card.find({}, (err, card) => {
		res.send(card);
	});
}

function update_card (req, res) {

	const filter = {_id: mongoose.Types.ObjectId(req.body._id)};
	const update = {position: {left: req.body.position.left, top: req.body.position.top}};

	Card.findOneAndUpdate (filter, update, {new: true},
		function (err) {
			if (err) console.log("Something wrong when updating data!");
		});

	io.emit("pos-update", JSON.stringify({
		_id: req.body._id,
		position: {
			left: req.body.position.left,
			top: req.body.position.top
		}
	}));
}

function get_cards (req, res) {
	res.render("boards/index");
}
