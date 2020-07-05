"use strict";

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
	cookieParser = require("cookie-parser"),
	keygen = require("keygenerator");

mongoose.connect(
	process.env.MONGODB_URI || "mongodb://localhost:27017/board_db",
	{useNewUrlParser: true, useFindAndModify: false}
);
mongoose.connection.once("open", () => {
	console.log("Connected to MongoDB");
});

app.use(express.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.json());
app.use(layouts);
app.use(express.static("public"));
const key = keygen.session_id();
app.use(cookieParser(key));
app.use(expressSession({
	secret: key,
	cookie: {
		maxAge: 4000000
	},
	resave: true,
	saveUninitialized: false
}));
app.use("/", indexRouter);
app.set("view engine", "ejs");
app.set("port", process.env.NODEPORT || process.env.PORT || 8080);

const socket = require("./controller/socket_controller.js");
socket.start(io);

server.listen(app.get("port"), () => {
	console.log(`Server running at http://localhost:${app.get("port")}`);
});
module.exports = app;

