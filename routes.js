var express = require("express");
var router = express.Router();

var indexController = require("./controller/index_controller");
var boardController = require("./controller/board_controller");
var appController = require("./controller/app_controller");

router.get("/", indexController.get_index);
router.post("/", boardController.create_board);
router.get("/get-linked-board/:cardId", boardController.get_linked_board);
router.get("/username", appController.set_username);
router.get("/board/:boardId", appController.get_username, boardController.get_board);
router.get("/board/:boardId/cards", boardController.get_cards);
router.get("/port", appController.get_port);


module.exports = router;
