var express = require("express");
var router = express.Router();

var indexController = require("./controller/index_controller");
var boardController = require("./controller/board_controller");
var appController = require("./controller/app_controller");

router.get("/", indexController.redirectToIndex);
router.get("/board", indexController.getIndex);

router.post("/", boardController.createBoard);
router.post("/board/:boardId", boardController.createChildBoard);
router.get("/board/:boardId", appController.setUsername, boardController.getBoard);
router.get("/board/:boardId/path", boardController.getPath);
router.get("/board/:boardId/data", boardController.getBoardData);
router.get("/board/:boardId/cards", boardController.getCards);
router.get("/board/:boardId/messages", boardController.getMessages);
router.get("/board/:boardId/connectors", boardController.getConnectors);
router.get("/board/:boardId/cards/:cardId/linked-board", boardController.getLinkedBoard);
router.get("/get-linked-board/:cardId", boardController.getLinkedBoard);

module.exports = router;
