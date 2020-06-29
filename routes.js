var express = require("express");
var router = express.Router();

var indexController = require("./controller/index_controller");
var boardController = require("./controller/board_controller");
var appController = require("./controller/app_controller");

router.get("/", indexController.redirect_to_index);
router.get("/board", indexController.get_index);
router.post("/", boardController.create_board);
router.post("/board/:boardId", boardController.create_child_board);
router.get("/board/:boardId/path", boardController.get_path);
router.get("/board/:boardId", appController.get_username, boardController.get_board);
router.get("/board/:boardId/data", boardController.get_board_data);
router.get("/board/:boardId/cards", boardController.get_cards);
router.get("/board/:boardId/messages", boardController.get_messages);
router.get("/board/:boardId/connectors", boardController.get_connectors);
router.get("/port", appController.get_port);
router.get("/get-linked-board/:cardId", boardController.get_linked_board);

module.exports = router;
