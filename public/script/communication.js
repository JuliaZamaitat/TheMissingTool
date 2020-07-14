//CHAT

toggleChatWindow();
$.get("/board/" + window.windowBoardId + "/messages", (messages) => {
	messages.forEach(addMessage);
	$("#messageCount").text((messageCount = 0).toString());
});

$("#chatInput").on("input keydown", function (e) {
	if ((e.keyCode == 10 || e.keyCode == 13)) {
		if (!e.shiftKey) {
			e.preventDefault();
			let text = $.trim($("#chatInput").val());
			if (text !== "") {
				let time = Date.now();
				$("#chatInput").val("");
				sendMessage({
					text: text,
					time: time,
					boardId: window.windowBoardId,
					username: window.username
				});
			}
			clearTimeout(timeout);
			typingTimeout();
		}
	} else {
		typing = true;
		let user = window.username;
		socket.emit("typing", {user: user, typing: true});
		clearTimeout(timeout);
		timeout = setTimeout(typingTimeout, 2000);
	}

	// Rescale textarea and chat
	$(this).css("height", "unset").height(this.scrollHeight - 10);
	chatRescaleContent();

});

function sendMessage(message) {
	socket.emit("message", message);
}

function addMessage(message) {
	$("#messageCount").text((++messageCount).toString());
	$("#chat-hint").fadeOut();
	let usernameEl = $("<b>").text(message.username);
	let time = new Date(message.time);
	let timeEl = $("<small>", {class: "text-secondary float-right"}).text(formatHours(time.getHours(), time.getMinutes()));
	let messageHeadEl = $("<div>", {class: "messageHead"}).append(usernameEl, timeEl);
	let messageTextEl = $("<div>", {class: "messageText"}).text(message.text);
	let messageEl = $("<div>", {class: "message"}).append(messageHeadEl, messageTextEl);
	$("#chatContent").prepend(messageEl);
	chatRescaleContent();
	chatScrollBottom();
}

function toggleChatWindow() {
	$("#open-chat").click(openChat);
	$("#chatHeader").click(closeChat);
	$("#close-chat").click(closeChat);

	function openChat() {
		$("#chatWindow").removeClass("closed");
		$("#chatWindow").addClass("opened");
		$("#open-chat").fadeOut();
	}

	function closeChat() {
		$("#open-chat").fadeIn();
		$("#chatWindow").removeClass("opened");
		$("#chatWindow").addClass("closed");
	}
}

function chatRescaleContent() {
	$("#chatContent").css("height", "calc(100% - " + $("#chatInputContainer").outerHeight() + "px)");
}

function chatScrollBottom() {
	$("#chatContent").scrollTop(chatContent.scrollHeight);
}

socket.on("message", addMessage);


//TYPING NOTIFICATION
let typing = false,
	timeout = undefined,
	messageCount = 0;

socket.on("display-typing-notification", (data) => {
	if (data.typing === true) {
		$("#notificationBox").text(data.user + " is typing");
		chatRescaleContent();
	} else {
		$("#notificationBox").text("");
		chatRescaleContent();
	}
});

function typingTimeout() {
	let user = window.username;
	typing = false;
	socket.emit("typing", {user: user, typing: false});
}


//USER LIST
let listOfUsers = [];

socket.on("update-users", (users) => {
	listOfUsers.length = 0;
	for (var i = 0; i < users.length; i++) {
		listOfUsers.push(users[i]);
	}
});

$(".pop-user-list").popover({
	placement: "top",
	trigger: "hover",
	html: true,
	content: function () {
		let result = $();
		for (let i = 0; i < listOfUsers.length; i++) {
			result = result.add("<p>" + listOfUsers[i] + "</p>");
		}
		return result;
	}
});


//FOCUS ON CARDS
$("#user-name").on("focusout", function () {

	changeUserName(this);
});

$("#user-name").keypress(function (event) {
	var keycode = (event.keyCode ? event.keyCode : event.which);
	if (keycode === 13) {
		event.preventDefault();
		changeUserName(this);
		this.blur();
	}
});

function changeUserName(text) {
	document.cookie = "username=" + $(text).text();

	window.username = cookieValue("username");
	console.log(window.username);
	socket.emit("update-user-name", window.username);
}

socket.on("focus-in", (data) => {
	var username = data.username;
	document.getElementById(username).style.display = "none";
	let card = document.getElementById(data.cardId);
	let borderType = "2px solid ";
	if (!card.classList.contains("triangle")) {
		card.querySelector("textarea").style.border = borderType + getFocusColor(card.style.backgroundColor);
	} else {
		let focusColor = getFocusColor(card.style.color);
		card.style.setProperty("--border-color", focusColor);
		card.style.borderBottom = borderType + focusColor;
	}
	let container = card.querySelector(".visitorContainer");
	container.style.display = "block";
	container.innerText = username;

	function getFocusColor(color) {
		switch (color) {
		case "rgb(255, 200, 200)":
			return "#ff7d8e";
		case "rgb(255, 253, 202)":
			return "#fff801";
		case "rgb(205, 244, 255)":
			return "#669fff";
		case "rgb(234, 212, 255)":
			return "#f16eff";
		default:
		}
	}
});

socket.on("focus-out", (data) => {
	var username = data.username;
	document.getElementById(username).style.display = "block";
	let card = document.getElementById(data.cardId);
	if (!card.classList.contains("triangle")) {
		card.querySelector("textarea").style.border = "none";
	} else {
		card.style.borderBottom = "none";
		card.style.setProperty("--border-color", "transparent");
	}
	let container = card.querySelector(".visitorContainer");
	container.style.display = "none";
});



//USER CURSOR
$(document).ready(function () {
	$(".pop-user-list").popover({
		placement: "top",
		trigger: "hover",
		html: true,
		content: function () {
			let result = $();
			for (let i = 0; i < listOfUsers.length; i++) {
				result = result.add("<p>" + listOfUsers[i] + "</p>");
			}
			return result;
		}
	});
});

function getCursorElement(data) {
	let username = data.username;
	let element = document.getElementById(username);
	if (element == null) {
		element = document.createElement("div");
		element.id = username;
		element.className = "mvcursor";
		element.innerHTML = "<img src='/icons/pointer.svg'><p>" + username + "</p>";
	}
	return element;
}

$(document).on("mousemove", function (event) {
	socket.emit("mouse-movement", {coords: {x: event.pageX, y: event.pageY}, username: window.username});
});

socket.on("mouse-movement", (data) => {
	var cursorElement = getCursorElement(data);
	cursorElement.style.left = data.coords.x + "px";
	cursorElement.style.top = data.coords.y + "px";
	$("body").append(cursorElement);
});

socket.on("delete-courser", username => {
	let usernameElement = document.getElementById(username);
	if (usernameElement !== null) usernameElement.remove();
});
