
window.onload = function () {
	$("#create-board").on("click", createBoard);
	$("#share-board").on("click", copyToClipboard);
};

function createBoard() {
	$.post("/",
		function (data) {
			window.setCookieAndChangeLocation(data);
		});
}

window.setCookieAndChangeLocation = (newBoard) => {
	let currentCookie = window.cookieValue("visitedBoards");
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
