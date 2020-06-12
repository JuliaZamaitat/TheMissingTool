window.onload = function () {
	$("#create-board").on("click", createBoard);
	$("#share-board").on("click", copyToClipboard);
};

function createBoard() {
	$.post("/",
		function (data) {
			changeLocationAndAppend(data);
		});
}

function changeLocationAndAppend(newBoard) {
	const url = new URL(window.location.href);
	let pathname = url.pathname.toString();
	const currentBoard = pathname.substr(pathname.lastIndexOf("/") + 1);
	const params = url.searchParams;
	let currentParams = params.get("linkedBoard");
	if (currentParams === null || currentParams === "") {
		params.set("linkedBoard", currentBoard);
	} else {
		var arrayOfLinkedBoards = currentParams.toString().split(",");
		if (!arrayOfLinkedBoards.includes(newBoard)) {
			arrayOfLinkedBoards.push(currentBoard);
			params.set("linkedBoard", arrayOfLinkedBoards);
		}
	}
	url.search = params.toString();
	url.pathname = "/board/" + newBoard;
	location.href = url.toString();
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
