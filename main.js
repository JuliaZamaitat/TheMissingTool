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
	cookieParser = require("cookie-parser"),
    keygen = require("keygenerator"),
    Card = require("./models/card"),
    Board = require("./models/board")


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
const key = keygen.session_id();
app.use(cookieParser(key)); // load the cookie-parsing middleware
app.use(expressSession({ //Configure express-session to use cookie-parser
	secret: key,
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

// Routes
app.get("/:boardId", get_board);
app.get("/board/:boardId", get_cards);
app.get("/get-linked-board/:cardId", get_linked_board);

// Controller
function get_board(req, res) {
    res.render("boards/index");
}

function get_cards(req, res) {
    let boardId = req.params.boardId;
    Card.find({boardId: boardId}, (err, cards) => {
        res.send(cards);
    });
}

function get_linked_board(req, res) {
    const filter = {_id: mongoose.Types.ObjectId(req.params.cardId)};
	Card.findOne(filter, (err, savedCard) => {
		res.send(savedCard.linkId);
	});
}


module.exports = app;

io.on('connection', function (socket) {
    let board;
    console.log('a user connected with id %s', socket.id);

    socket.on('join', function (room) {
        socket.join(room);
        board = room;
        console.log(socket.id, "joined", room);
    });

    socket.on('save-card', function (req) {
        const card = new Card(
            {
                _id: new mongoose.mongo.ObjectId(),
                backgroundColor: req.color,
                position: {
                    left: null,
                    top: null
                },
                boardId: board,
                type: req.type,
                linkId: req.linkId
            });
        card.save((err) => {
            if (err) {
                console.log("Something wrong saving card");
            }
            io.to(board).emit("new-card", JSON.stringify(card));
        });
    });

    socket.on('update-pos', function (req) {
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

    socket.on('delete-card', function (req) {
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

    socket.on('update-text', function (req) {
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
});

module.exports = app;

const socket = require("./server_sockets.js");
socket.start(io);