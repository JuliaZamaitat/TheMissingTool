window.onload = function () {
    $('#create-board').on('click', createBoard);
    $('#share-board').on('click', shareBoard);
    $('#delete-board').on('click', deleteBoard);
    $('#export-board').on('click', exportBoard);
};

function createBoard() {
    $.post("/",
        function (data) {
            location.href = "/board/" + data;
        });
}

function shareBoard() {
    // TODO
}

function deleteBoard() {
    // TODO
    location.href = "/";
}

function exportBoard() {
    // TODO
}
