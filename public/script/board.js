var zoom = "100";

$(document).ready(function () {
	if (window.windowBoardId !== "board") {
		$.get("/board/" + window.windowBoardId + "/path", (path) => {
			addToLoastVisitedCookie(path[0]);
			for (let i = 0; i < path.length; i++) {
				$.get({
					url: "/board/" + path[i] + "/data",
					success: function (boardData) {
						if (boardData !== "") {
							var element = document.createElement("p");
							var text = document.createTextNode(boardData.name + "/");
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

		$("#create-new-board").on("click", createRootBoard);
		$("#share-board").on("click", copyToClipboard);
		$("#folder").on("click", showOrHide);
		$("#back-button").on("click", goToParent);
		zoomOnclick();
	}
	$("#create-board").on("click", createRootBoard);
});


function createRootBoard() {
	$.post("/",
		function (boardId) {
			console.log("IN HERE");
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

// change location
function forwardToBoard(newBoard) {
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
