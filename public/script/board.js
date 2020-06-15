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
	const url = new URL(window.location.href);
	let pathname = url.pathname.toString();
	const currentBoard = pathname.substr(pathname.lastIndexOf("/") + 1);
	let currentCookie = cookieValue("linkedBoard");
	if (currentCookie === null || currentCookie === "") {
		document.cookie = "linkedBoard=" + currentBoard;
	} else {
		var arrayOfLinkedBoards = currentCookie.toString().split(",");
		if (!arrayOfLinkedBoards.includes(newBoard)) {
			arrayOfLinkedBoards.push(currentBoard);
			document.cookie = "linkedBoard=" + arrayOfLinkedBoards;
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

function cookieValue(name) {
	let rightRow = document.cookie.split("; ").find(row => row.startsWith(name));
	if (rightRow !== null && rightRow !== undefined) {
		return decodeURIComponent(rightRow.split("=")[1]);
	} else {
		return null;
	}

}
