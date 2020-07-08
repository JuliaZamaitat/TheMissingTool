let typing = false,
	timeout = undefined,
	messageCount = 0;
let listOfUsers = [];

$(document).ready(function () {

	$("#chatInput").keypress((e) => {
		if (e.which !== 13) {
			typing = true;
			let user = window.username;
			socket.emit("typing", {user: user, typing: true});
			clearTimeout(timeout);
			timeout = setTimeout(typingTimeout, 2000);
		} else {
			clearTimeout(timeout);
			typingTimeout();
		}
	});

	//display a notification when a user is typing
	socket.on("display", (data) => {
		if (data.typing === true) {
			$("#notificationbox").text(data.user + " is typing");
			chatRescaleContent();
		} else {
			$("#notificationbox").text("");
			chatRescaleContent();
		}
	});

	toggleChatWindow();
});

$.get("/board/" + window.windowBoardId + "/messages", (messages) => {
	messages.forEach(addMessage);
	$("#messageCount").text((messageCount = 0).toString());
});

//Send mere message to server, without username and time
function sendMessage(message) {
	socket.emit("message", message);
}

socket.on("message", addMessage);

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

// Adjust chat content height, in case input height changes
const chatRescaleContent = () => {
	$("#chatContent").css("height", "calc(100% - " + $("#chatInputContainer").outerHeight() + "px)");
};

//Scroll to bottom
const chatScrollBottom = () => {
	$("#chatContent").scrollTop(chatContent.scrollHeight);
};

//Listens for chat keyboard input
$("#chatInput").on("input keydown", function (e) {
	if ((e.keyCode == 10 || e.keyCode == 13)) { //If Enter is pressed
		if (!e.shiftKey) { //If Shift is not pressed
			e.preventDefault(); //Prevent new line
			let text = $.trim($("#chatInput").val()); //Get input
			if (text !== "") { //If it's not empty
				let time = Date.now(); //Timestamp in ms
				//Clear textarea
				$("#chatInput").val("");
				//Send message without username
				sendMessage({
					text: text,
					time: time,
					boardId: window.windowBoardId,
					username: window.username
				});
			}
		}
	}

	// Rescale textarea and chat
	$(this).css("height", "unset").height(this.scrollHeight - 10);
	chatRescaleContent();
});

function typingTimeout() {
	let user = window.username;
	typing = false;
	socket.emit("typing", {user: user, typing: false});
}

socket.on("update-users", (users) => {
	listOfUsers.length = 0;
	for (var i = 0; i < users.length; i++) {
		listOfUsers.push(users[i]);
	}
});

$("#user-name").on("focusout", function () {
	document.cookie = "username=" + $(this).text();
	window.username = cookieValue("username");
	socket.emit("update-user-name", window.username);
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

socket.on("focus-in", (data) => {
	var username = data.username;
	document.getElementById(username).style.display = "none";
	let card = document.getElementById(data.cardId);
	let borderType = "2px solid ";
	if (!card.classList.contains("triangle")) {
		card.querySelector("textarea").style.border = getFocusColor(card.style.backgroundColor);
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
	card.querySelector("textarea").style.border = "none";
	if (!card.classList.contains("triangle")) {
		card.querySelector("textarea").style.border = "none";
	} else {
		card.style.borderBottom = "none";
		card.style.setProperty("--border-color", "transparent");
	}
	let container = card.querySelector(".visitorContainer");
	container.style.display = "none";
});

socket.on("delete-courser", username => {
	let usernameElement = document.getElementById(username);
	if (usernameElement !== null) usernameElement.remove();
});

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


$(document).on("mousemove", function (event) {
	socket.emit("mouse-movement", {coords: {x: event.pageX, y: event.pageY}, username: window.username});
});

socket.on("mouse-movement", (data) => {
	var el = getCursorElement(data);
	el.style.left = data.coords.x + "px";
	el.style.top = data.coords.y + "px";
	$("body").append(el);
});
