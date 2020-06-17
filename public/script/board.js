window.onload = function () {
	$("#create-board").on("click", createBoard);
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

var zoom = "100";
function zoomOnclick() {
	var interval = 0;
	$("#zoom-in").mousedown(function() {
		interval = setInterval(zoomIn(), 50);
	}).mouseup(function() {
		clearInterval(interval);
	});
	
	$("#zoom-out").mousedown(function() {
		interval = setInterval(zoomOut(), 50);
	}).mouseup(function() {
		clearInterval(interval);
	});
}

document.getElementById("zoom-slider").addEventListener("input", function() {
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

