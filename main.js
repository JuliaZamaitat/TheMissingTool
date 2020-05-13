const express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    layouts = require("express-ejs-layouts"),
    mongoose = require("mongoose"),
    Card = require("./models/card"),

    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server);

mongoose.Promise = global.Promise;

const db = mongoose.connection;
db.once("open", () => {
    console.log("Connected to MongoDB");
});

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(layouts);
app.use(express.static("public"));
app.set("port", process.env.PORT || 4000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

app.get("/", (req, res) => {
    Card.find({})
        .exec()
        .then((cards) => {
            res.render("boards/index", {
                cards: cards,
            });
        })
        .catch((error) => {
            console.log(error.message);
            return [];
        })
        .then(() => {
            console.log("promise complete");
        });
});

app.get("/cards", (req, res) => {
    Card.find({}, (err, card) => {
        res.send(card);
    })
});

app.post("/", (req, res) => {
    const card = new Card(
        {
            backgroundColor: req.body.color,
            position: {
                left: null,
                top: null
            },
            text: null,
            fontSize: 24
        }
    );

    card.save((err) => {
        if (err)
            sendStatus(500);
        io.emit('card', JSON.stringify(card));
        res.sendStatus(200);

    })
});

io.on('connection', () => {
    console.log('a user is connected')
});

mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/board_db",
    {useNewUrlParser: true, useFindAndModify: false}
);

server.listen(app.get("port"), () => {
    console.log(`Server running at http://localhost:${app.get("port")}`);
});







