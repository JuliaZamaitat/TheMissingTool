window.onload = function() {
    $('#create-board').on('click', createBoard);
    $('#share-board').on('click', shareBoard);
    $('#delete-board').on('click', deleteBoard);
    $('#export-board').on('click', exportBoard);
}

function createBoard() {
    var boardId = getRandomBoardID();
    $.post("/" + boardId);
    location.href = "/board/" + boardId;
}

function shareBoard() {
    // TODO
}

function deleteBoard() {
    // TODO
    location.href= "/";
}

function exportBoard() {
    // TODO
}

function getRandomBoardID() {
    return Math.floor(Math.random() * (999 - 1) + 1);
}
