$(document).ready(function () {

	let visitedBoardsString = cookieValue("visitedBoards");
	if (visitedBoardsString !== null) {
		const visitedBoards = toArray(visitedBoardsString);
		if (Array.isArray(visitedBoards)) {
			visitedBoards.forEach(board => {
				if (board !== null && board !== window.windowBoardId) {
					appendToCookieList(board);
				}
			});
		}
	} else {
		$("#lastSeen-container").hide();
	}

	function appendToCookieList(boardId) {
		$.get("/board/" + boardId + "/data", (board) => {
			if (board !== "" && board.name !== "") {
				const li = document.createElement("li");
				const text = document.createTextNode(board.name);
				li.appendChild(text);
				li.id = board._id;
				li.className = "board-link";
				li.addEventListener("mousedown", function () {
					forwardToBoard(li.id);
				});
				document.getElementById("visitedBoards").appendChild(li);
			}
		});
	}

	$("#acceptBtn").on("click", function(){
		let x = document.getElementById("cookieFooter");
		if (x.style.display === "none") {
			x.style.display = "block";
		} else {
			x.style.display = "none";
		}
	});
});

