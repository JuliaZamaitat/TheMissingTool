$(document).ready(function () {
	if (window.windowBoardId !== "board") {
		$.get("/board/" + window.windowBoardId + "/path", (path) => {
			console.log(path[0]);
			addToLoastVisitedCookie(path[0]);
			for (let i = 0; i < path.length; i++) {
				$.get({
					url: "/board/" + path[i] + "/data",
					success: function (boardData) {
						if (boardData !== "") {
							const element = document.createElement("p");
							const text = document.createTextNode(boardData.name + "/");
							element.appendChild(text);
							element.id = boardData._id;
							element.addEventListener("mousedown", function () {
								forwardToBoard(element.id);
							});
							document.getElementById("board_path").appendChild(element);
						}
					},
					async: false
				});
			}
		});

		if ($("#setNameModal")) {
			$("#setNameModal").modal("show");
			$("#board-name-input").on("input", () => {
				$("#board-name-button").prop("disabled", !$("#board-name-input").val().trim());
			});
		}

		//Update board name via modal
		$("#board-name-form").on("submit", e => {
			e.preventDefault();
			$("#setNameModal").modal("hide");
			updateBoardName($("#board-name-input-modal").val().trim());
		});

		$("#create-new-board").on("click", createRootBoard);
		$("#share-board").on("click", copyToClipboard);
		$("#folder").on("click", showOrHide);
		$("#back-button").on("click", goToParent);
	}
	$("#create-board").on("click", createRootBoard);
});

function createRootBoard() {
	$.post("/",
		function (boardId) {
			forwardToBoard(boardId);
		});
}

function copyToClipboard() {
	const temp = document.createElement("input"), text = window.location.href;
	document.body.appendChild(temp);
	temp.value = text;
	temp.select();
	document.execCommand("copy");
	document.body.removeChild(temp);

	$(".notifier").toggleClass("active");
	setTimeout(function () {
		$(".notifier").removeClass("active");
	}, 1000);
}

function showOrHide() {
	$("#dropdown-content").fadeToggle();
}

function goToParent() {
	$.get("/board/" + window.windowBoardId + "/path",
		function (path) {
			let parentBoard = path[path.length - 1];
			if (parentBoard !== undefined) {
				forwardToBoard(parentBoard);
			}
		});
}

function addToLoastVisitedCookie(parentBoard) {
	if (parentBoard === undefined) {
		parentBoard = window.windowBoardId;
	}
	let arrayOfVisitedBoards = [];
	let currentCookie = cookieValue("visitedBoards");
	if (currentCookie !== null) {
		arrayOfVisitedBoards = toArray(currentCookie);
	}
	if (!arrayOfVisitedBoards.includes(parentBoard)) {
		arrayOfVisitedBoards.push(parentBoard);
		document.cookie = "visitedBoards=" + arrayOfVisitedBoards;
	}
}

function forwardToBoard(newBoard) {
	location.href = "/board/" + newBoard;
}

$("#board-name").on("focusout", () => {
	updateBoardName($("#board-name").text());
});

$("#board-name").keypress(function (event) {
	var keycode = (event.keyCode ? event.keyCode : event.which);
	console.log(keycode);
	if (keycode === 13) {
		updateBoardName($("#board-name").text());
		this.blur();
	}
});

function updateBoardName(name) {
	socket.emit("update-board-name", {
		_id: window.windowBoardId,
		name: name
	});
}

socket.on("board-name-update", (data) => {
	const name = JSON.parse(data).name;
	$("#board-name").text(name);
});

$("#delete-board").on("click", () => {
	socket.emit("delete-board", {_id: window.windowBoardId});
});

socket.on("board-deleted", () => {
	location.href = "/";
});
