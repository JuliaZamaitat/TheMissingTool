"use strict";

//Require the necessary modules
const express = require("express"),
	app = express(),
	layouts = require("express-ejs-layouts"),
	mongoose = require("mongoose"),
	bodyParser = require("body-parser"),
	http = require("http"),
	server = http.Server(app),
	io = require("socket.io")(server),
	indexRouter = require("./routes"),
	expressSession = require("express-session"),
	cookieParser = require("cookie-parser");


//Connects either to the procution database, docker db or our local database
mongoose.connect(
	process.env.MONGODB_URI || "mongodb://localhost:27017/board_db",
	{useNewUrlParser: true, useFindAndModify: false}
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
app.use(bodyParser.json());
app.use(express.json());
//Tell node to use layouts and to look in the public folder for static files
app.use(layouts);
app.use(express.static("public"));


//Sets the necessary variables
app.set("view engine", "ejs");
app.set("port", process.env.NODEPORT || process.env.PORT || 8080);

app.use(cookieParser("secret_passcode")); // load the cookie-parsing middleware
app.use(expressSession({ //Configure express-session to use cookie-parser
	secret: "secret_passcode",
	cookie: {
		maxAge: 4000000
	},
	resave: true,
	saveUninitialized: false
}));

app.use("/", indexRouter);

server.listen(app.get("port"), () => {
	console.log(`Server running at http://localhost:${app.get("port")}`);
});

module.exports = app;

const socket = require("./server_sockets.js");
socket.start(io);
