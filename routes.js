var express = require('express');
var router = express.Router();

var indexController = require('./controller/index_controller');
var boardController = require('./controller/board_controller');

router.get("/", indexController.get_index);
router.post("/", boardController.create_board);
router.get("/board/:boardId", boardController.get_board);
router.get("/board/:boardId/cards", boardController.get_cards);

module.exports = router;
