$(document).ready(function () {

	let visitedBoardsString = cookieValue("visitedBoards");
	if (visitedBoardsString !== null) {
		const visitedBoards = toArray(visitedBoardsString);
		if (visitedBoards.isArray()) {
			visitedBoards.forEach(board => {
				if (board !== null && board !== window.windowBoardId) {
					appendToCookieList(board);
				}
			});
		}
	}

	function appendToCookieList(boardId) {
		$.get("/board/" + boardId + "/data", (board) => {
			if (board !== "" && board.name !== "") {
				const li = document.createElement("li");
				const text = document.createTextNode(board.name);
				li.appendChild(text);
				li.id = board._id;
				li.className = "list-group-item boardLink";
				li.addEventListener("mousedown", function () {
					forwardToBoard(li.id);
				});
				document.getElementById("visitedBoards").appendChild(li);
			}
		});
	}
});

