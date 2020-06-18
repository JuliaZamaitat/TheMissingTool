var zoom = "100";

$(document).ready(function () {

	$.get("/board/" + window.windowBoardId + "/path", (path) => {
		console.log(path)
		for (let i = 0; i < path.length; i++) {
			var boardId = path[i];
			$.get("/board/" + boardId + "/data", (boardData) => {
				if (boardData !== "") {
					var element = document.createElement("p");
					var text = document.createTextNode( "/" + boardData.name);
					element.appendChild(text);
					element.id = boardData._id;
					element.addEventListener("mousedown", function () {
						setCookieAndChangeLocation(element.id);
					});
					document.getElementById("board_path").appendChild(element);
				}
			});
		}
	});

	let currentBoards = cookieValue("visitedBoards");
	if (currentBoards !== null) {
		const arrayOfVisitedBoards = currentBoards.toString().split(",");
		if (arrayOfVisitedBoards !== null && arrayOfVisitedBoards !== undefined) {
			$("#folder").fadeIn();
			arrayOfVisitedBoards.forEach(element => {
				if (element !== null && element !== window.windowBoardId) {
					appendNameToBoardList(element);
				}
			});
		}
	}

	function appendNameToBoardList(boardId) {
		if (boardId !== null && boardId !== "") {
			$.get("/board/" + boardId + "/data", (boardData) => {
				if (boardData !== "") {
					var element = document.createElement("p");
					var text = document.createTextNode(boardData.name);
					element.appendChild(text);
					element.id = boardData._id;
					element.className = "boardLink";
					element.addEventListener("mousedown", function () {
						setCookieAndChangeLocation(element.id);
					});
					document.getElementById("dropdown-content").appendChild(element);
				}
			});
		}
	}
});

window.onload = function () {
	//If the modal for the board name is rendered then show it
	if ($("#setNameModal")) {
		$("#setNameModal").modal("show");
		//Keep submit button disabled as long as input is empty
		$("#board-name-input").on("input", () => {
			$("#board-name-button").prop("disabled", !$("#board-name-input").val().trim());
		});
	}
	//Update board name via modal
	$("#board-name-form").submit(e => {
		e.preventDefault();
		$("#setNameModal").modal("hide");
		updateBoardName($("#board-name-input").val().trim());
	});
	$("#create-board").on("click", createBoard);
	$("#create-child-board").on("click", createChildBoardAndForward);
	$("#share-board").on("click", copyToClipboard);
	$("#folder").on("click", showOrHide);
	zoomOnclick();
};

function createBoard() {
	$.post("/",
		function (data) {
			setCookieAndChangeLocation(data);
		});
}

function createChildBoardAndForward() {
	$.post("/board/" + window.windowBoardId,
		function (data) {
			setCookieAndChangeLocation(data);
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

// zooming
function zoomOnclick() {
	var interval = 0;
	$("#zoom-in").mousedown(function () {
		interval = setInterval(zoomIn(), 50);
	}).mouseup(function () {
		clearInterval(interval);
	});

	$("#zoom-out").mousedown(function () {
		interval = setInterval(zoomOut(), 50);
	}).mouseup(function () {
		clearInterval(interval);
	});

	$("#zoom-slider").on("input", function () {
		const zoomVal = document.getElementById("zoom-slider").value;
		document.getElementById("overlay").style.zoom = zoomVal + "%";
		document.getElementById("zoom-size").innerHTML = zoomVal + "%";
	});

	function zoomIn() {
		zoom++;
		document.getElementById("overlay").style.zoom = zoom + "%";
		document.getElementById("zoom-slider").value = zoom;
		document.getElementById("zoom-size").innerHTML = zoom + "%";
		if (zoom > 200) return;
	}

	function zoomOut() {
		zoom--;
		document.getElementById("overlay").style.zoom = zoom + "%";
		document.getElementById("zoom-slider").value = zoom;
		document.getElementById("zoom-size").innerHTML = zoom + "%";
		if (zoom < 1) return;
	}
}

// change location and append current board to lastVisited cookie
function setCookieAndChangeLocation(newBoard) {
	let arrayOfVisitedBoards = [];
	let currentCookie = cookieValue("visitedBoards");

	if (currentCookie === null || currentCookie === "" || currentCookie === undefined) {
		if (window.windowBoardId !== undefined) {
			document.cookie = "visitedBoards=" + window.windowBoardId;
			location.href = "/board/" + newBoard;
		}
	} else {
		arrayOfVisitedBoards = currentCookie.toString().split(",");
		if (arrayOfVisitedBoards === undefined) {
			arrayOfVisitedBoards = "";
		}
		if (arrayOfVisitedBoards.includes(window.windowBoardId)) {
			for (let i = 0; i < arrayOfVisitedBoards.length; i++) {
				if (arrayOfVisitedBoards[i] === window.windowBoardId) {
					arrayOfVisitedBoards.splice(i, 1);
				}
			}
		}
		if (window.windowBoardId !== undefined) {
			arrayOfVisitedBoards.push(window.windowBoardId);
		}
	}
	document.cookie = "visitedBoards=" + arrayOfVisitedBoards;
	location.href = "/board/" + newBoard;
}

// update board name
$("#board-name").on("focusout", () => {
	updateBoardName($("#board-name").text());
});

function updateBoardName(newName) {
	socket.emit("update-board-name", {
		_id: windowBoardId,
		name: newName
	});
}

socket.on("board-name-update", (data) => {
	const name = JSON.parse(data).name;
	$("#board-name").text(name);
});

// delete board
$("#delete-board").on("click", () => {
	socket.emit("delete-board", {_id: window.windowBoardId});
});

socket.on("board-deleted", () => {
	location.href = "/";
});
