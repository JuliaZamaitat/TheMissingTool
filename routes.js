var express = require("express");
var router = express.Router();

var indexController = require("./controller/index_controller");
var boardController = require("./controller/board_controller");
var appController = require("./controller/app_controller");

router.get("/", indexController.redirectToIndex);
router.get("/board", indexController.getIndex);

router.post("/", boardController.create_board);
router.post("/board/:boardId", boardController.create_child_board);
router.get("/board/:boardId", appController.setUsername, boardController.get_board);
router.get("/board/:boardId/path", boardController.get_path);
router.get("/board/:boardId/data", boardController.get_board_data);
router.get("/board/:boardId/cards", boardController.getCards);
router.get("/board/:boardId/messages", boardController.get_messages);
router.get("/board/:boardId/connectors", boardController.get_connectors);
router.get("/board/:boardId/cards/:cardId/linked-board", boardController.getLinkedBoard);
router.get("/get-linked-board/:cardId", boardController.getLinkedBoard);

module.exports = router;
