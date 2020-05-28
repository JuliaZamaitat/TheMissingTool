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
	resave: false,
	saveUninitialized: false
}));

app.use((req, res, next) => { //middleware to associate connectFlash to flashes on response
	console.log("In middleware");
	//res.cookie("name", "express").send("cookie set");
	console.log("Cookies: ", req.cookies);
	var userNames = ["Hase", "Esel", "Adler", "Steinbock", "Pferd", "Schlange", "Mops", "Igel", "Fisch"];

	var cookie = req.cookies.username;
	if (cookie === undefined) {
		userNames = shuffle(userNames)
		var username = userNames[1];
		res.cookie("username", username);

		console.log("cookie created successfully");
	}
	else {
		// yes, cookie was already present
		console.log("cookie exists", cookie);
	}
	res.locals.username = cookie;
	next();

});

function shuffle(array){
	for(let i = array.length - 1; i > 0; i--){
	  const j = Math.floor(Math.random() * i);
	  const temp = array[i];
	  array[i] = array[j];
	  array[j] = temp;
	}
	return array;
}

app.use("/", indexRouter);

server.listen(app.get("port"), () => {
	console.log(`Server running at http://localhost:${app.get("port")}`);
});

module.exports = app;

const socket = require("./server_sockets.js");
socket.start(io);
