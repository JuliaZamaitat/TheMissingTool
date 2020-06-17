window.onload = function () {
	//If the modal for the board name is rendered then show it
	if($("#setNameModal")) {
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
	$("#share-board").on("click", copyToClipboard);
	$("#folder").on("click", showOrHide);
};

function createBoard() {
	$.post("/",
		function (data) {
			setCookieAndChangeLocation(data);
		});
}

function showOrHide() {
	$("#dropdown-content").fadeToggle();
}

function setCookieAndChangeLocation(newBoard) {
	let currentCookie = cookieValue("visitedBoards");
	if (currentCookie === null || currentCookie === "") {
		document.cookie = "visitedBoards=" + window.windowBoardId;
	} else {
		var arrayOfVisitedBoards = currentCookie.toString().split(",");
		if (!arrayOfVisitedBoards.includes(window.windowBoardId)) {
			arrayOfVisitedBoards.push(window.windowBoardId);
			document.cookie = "visitedBoards=" + arrayOfVisitedBoards;
		}
	}
	location.href = "/board/" + newBoard;
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

function cookieValue(name) {
	let rightRow = document.cookie.split("; ").find(row => row.startsWith(name));
	if (rightRow !== null && rightRow !== undefined) {
		return decodeURIComponent(rightRow.split("=")[1]);
	} else {
		return null;
	}
}
