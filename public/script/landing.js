$(document).ready(function () {

	let currentBoards = cookieValue("visitedBoards");
	if (currentBoards !== null) {
		const arrayOfVisitedBoards = currentBoards.toString().split(",");
		if (arrayOfVisitedBoards !== null && arrayOfVisitedBoards !== undefined) {
			arrayOfVisitedBoards.forEach(boardId => {
				if (boardId !== null && boardId !== window.windowBoardId) {
					appendNameToBoardList(boardId);
				}
			});
		}
	}

	function appendNameToBoardList(boardId) {
		$.get("/board/" + boardId + "/data", (boardData) => {
			if (boardData !== "" && boardData.name !== "") {
				var element = document.createElement("li");
				var text = document.createTextNode(boardData.name);
				element.appendChild(text);
				element.id = boardData._id;
				element.className = "boardLink neu-button plain";
				element.addEventListener("mousedown", function () {
					forwardToBoard(element.id);
				});
				document.getElementById("visitedBoards").appendChild(element);
			}
		});
	}
});

