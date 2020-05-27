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
    Card = require("./models/card"),
    Board = require("./models/board");

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

server.listen(app.get("port"), () => {
    console.log(`Server running at http://localhost:${app.get("port")}`);
});

// Routes
app.get("/", get_index);
app.post("/", create_board);
app.get("/board/:boardId", get_board);
app.get("/board/:boardId/cards", get_cards);
app.get("/board-by-card/:cardId", get__linked_board_by_card);

// Controller
function get_index(req, res) {
    res.render("landing");
}

function create_board(req, res) {
    var newBoard =
        new Board({
            _id: new mongoose.mongo.ObjectId(),
            name: "The coolest board"
        });
    newBoard.save((err) => {
        if (err) {
            console.log("Error creating board");
        } else {
            res.send(newBoard._id);
        }
    })
}

function get_board(req, res) {
    const filter = {_id: mongoose.Types.ObjectId(req.params.boardId)};
    Board.findOne(filter, (err, savedBoard) => {
        res.render("boards/index", {board: savedBoard});
    });
}

function get_cards(req, res) {
    const filter = {boardId: mongoose.Types.ObjectId(req.params.boardId)};
    Card.find(filter, (err, cards) => {
        res.send(cards);
    });
}

function get__linked_board_by_card(req, res) {
    const cardFilter = {_id: mongoose.Types.ObjectId(req.params.cardId)};
    Card.findOne(cardFilter, (err, savedCard) => {
            const boardFilter = {_id: mongoose.Types.ObjectId(savedCard.linkId)};
            Board.findOne(boardFilter, (err, savedBoard) => {
                res.render("boards/index", {board: savedBoard});
            });
        }
    );
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
                boardId: mongoose.Types.ObjectId(board)
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

    socket.on('update-board-name', function (req) {
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
        )
    });

    socket.on('delete-board', function (req) {
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

