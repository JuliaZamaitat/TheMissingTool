"use strict";

//Require the necessary modules
const express = require("express"),
  app = express(),
  layouts = require("express-ejs-layouts"),
  boardsController = require("./controllers/boardsController"),
  mongoose = require("mongoose");

const http = require('http').Server(app);
const io = require('socket.io')(http);

//Tell node to use promises with mongoose
mongoose.Promise = global.Promise;

//Connects either to the procution database or our local database
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
app.set("port", process.env.PORT || 4000);

var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

//Routes
app.get("/", boardsController.getAllCards);
// app.get('/', (req,res) => {
//   res.sendFile(__dirname + '/index.html')
// })


app.get("/cards", boardsController.get_card);
app.post("/", boardsController.save_card);

//Start listening to the PORT
app.listen(app.get("port"), () => {
  console.log(`Server running at http://localhost:${app.get("port")}`);
});

