const socket = io();

const url = new URL(window.location.href);
let pathname = url.pathname.toString();
window.windowBoardId = pathname.substr(pathname.lastIndexOf("/") + 1);

$(document).ready(function () {
	socket.emit("join", {boardId: window.windowBoardId, name: cookieValue("username")});
	$("#username-hint").fadeIn();
	setTimeout(function() {
		$("#username-hint").fadeOut();
	},3000);
	toggleBoardPath();
});

let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// time
function add0(val) {
	if (val < 10) {
		return "0" + val;
	} else {
		return val;
	}
}

function formatHours(hour, minutes) {
	if (hour > 12) {
		return add0(hour - 12) + ":" + add0(minutes) + "pm";
	} else if (hour === 12) {
		return hour + ":" + add0(minutes) + "pm";
	} else if (hour === 0) {
		return "12:" + add0(minutes) + "am";
	} else {
		return add0(hour) + ":" + add0(minutes) + "am";
	}
}

// get cookie value from cookie name
function cookieValue(name) {
	let rightRow = document.cookie.split("; ").find(row => row.startsWith(name));
	if (rightRow !== null && rightRow !== undefined) {
		return decodeURIComponent(rightRow.split("=")[1]);
	} else {
		return null;
	}
}

function toggleBoardPath() {
	$("#collapse-path").click(function() {
		$("#board_path").hide();
		$(this).hide();
		$("#expand-path").show();
	});

	$("#expand-path").click(function() {
		$("#board_path").show();
		$(this).hide();
		$("#collapse-path").show();
	});
}
