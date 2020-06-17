window.onload = function () {
	$("#create-board").on("click", createBoard);
	$("#share-board").on("click", copyToClipboard);
	$("#folder").on("click", showOrHide);
	$("#back-button").on("click", goBack);
};

function createBoard() {
	$.post("/",
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

function goBack() {
	let currentCookie = cookieValue("visitedBoards");
	if (currentCookie !== null || currentCookie !== "") {
		const arrayOfVisitedBoards = currentCookie.toString().split(",");
		const lastBoard = arrayOfVisitedBoards[arrayOfVisitedBoards.length - 1];
		setCookieAndChangeLocation(lastBoard);
	}
}

function setCookieAndChangeLocation(newBoard) {
	let currentCookie = cookieValue("visitedBoards");
	if (currentCookie === null || currentCookie === "" || currentCookie === undefined) {
		if (window.windowBoardId !== undefined) {
			document.cookie = "visitedBoards=" + window.windowBoardId;
		}
	} else {
		let arrayOfVisitedBoards = currentCookie.toString().split(",");
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
		document.cookie = "visitedBoards=" + arrayOfVisitedBoards;
	location.href = "/board/" + newBoard;
}

function cookieValue(name) {
	let rightRow = document.cookie.split("; ").find(row => row.startsWith(name));
	if (rightRow !== null && rightRow !== undefined) {
		return decodeURIComponent(rightRow.split("=")[1]);
	} else {
		return null;
	}
}
