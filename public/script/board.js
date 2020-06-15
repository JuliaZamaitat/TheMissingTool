
window.onload = function () {
	$("#create-board").on("click", createBoard);
	$("#share-board").on("click", copyToClipboard);
};

function createBoard() {
	$.post("/",
		function (data) {
			setCookieAndChangeLocation(data);
		});
}

function setCookieAndChangeLocation(newBoard) {
	let currentCookie = cookieValue("visitedBoards");
	if (currentCookie === null || currentCookie === "") {
		document.cookie = "visitedBoards=" + windowBoardId;
	} else {
		var arrayOfVisitedBoards = currentCookie.toString().split(",");
		if (!arrayOfVisitedBoards.includes(windowBoardId)) {
			arrayOfVisitedBoards.push(windowBoardId);
			document.cookie = "visitedBoards=" + arrayOfVisitedBoards;
		}
	}
	location.href = "/board/" + newBoard;
}

function copyToClipboard() {
	// need temp since for .execCommand item needs to be selected before and
	// window.location.href can not be selected
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
