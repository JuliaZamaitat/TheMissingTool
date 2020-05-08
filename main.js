"use strict";

const express = require("express"),
  app = express(),
  layouts = require("express-ejs-layouts");



app.set("view engine", "ejs");
app.use(layouts);



app.set("port", process.env.PORT || 4000);

app.get("/", (req, res) => {
  res.render("index");
})


//Start listening to the PORT
app.listen(app.get("port"), () => {
  console.log(`Server running at http://localhost:${app.get("port")}`);
});
