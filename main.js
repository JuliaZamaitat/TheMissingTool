const express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    layouts = require("express-ejs-layouts"),
    mongoose = require("mongoose"),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    Card = require('./models/card');

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
app.set("port", process.env.PORT || 4000);
app.use(bodyParser.json());

mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.once("open", () => {
    console.log("Connected to MongoDB");
});

mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/board_db",
    {useNewUrlParser: true, useFindAndModify: false}
);

io.on('connection', () => {
    console.log('A new user is connected')
});

server.listen(app.get("port"), () => {
    console.log(`Server running at http://localhost:${app.get("port")}`);
});

// Routes
app.get("/", get_cards);
app.get("/data", get_cards_data);
app.post("/update-pos", update_card);
app.post("/", save_card);
app.post("/delete-card", delete_card);

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
            },
        }
    );
    card.save((err) => {
        if (err)
            sendStatus(500);
        io.emit('new-card', JSON.stringify(card));
        res.sendStatus(200);

    })
}

function get_cards_data(req, res) {
    Card.find({}, (err, card) => {
        res.send(card);
    })
}

function update_card(req, res) {

    const filter = {_id: mongoose.Types.ObjectId(req.body._id)};
    const update = {position: {left: req.body.position.left, top: req.body.position.top}};

    Card.findOneAndUpdate(filter, update, {new: true},
        function (err) {
            if (err) {
                console.log("Something wrong when updating data!");
            }
            io.emit('pos-update', JSON.stringify({
                _id: req.body._id,
                position: {
                    left: req.body.position.left,
                    top: req.body.position.top
                }
            }));
            res.sendStatus(200);
        });
}

function get_cards(req, res) {
    res.render("boards/index");
}

function delete_card(req, res) {
    const filter = {_id: mongoose.Types.ObjectId(req.body._id)};

    Card.deleteMany(filter,
        function (err) {
            if (err) {
                console.log("Something wrong when deleting data!");
            }
            io.emit('delete-card', JSON.stringify({
                _id: req.body._id
            }));
            res.sendStatus(200);
        });
}
