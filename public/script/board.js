window.onload = function () {
    $("#create-board").on("click", createBoard);
};

function createBoard() {
    $.post("/",
        function (data) {
            location.href = "/board/" + data;
        });
}
