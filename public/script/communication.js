let typing = false,
	timeout = undefined,
	messageCount = 0;

$(document).ready(function () {

	$("#chatInput").keypress((e) => {
		if (e.which !== 13) {
			typing = true;
			let user = cookieValue("username");
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

$("#open-chat").click(function () {
	$("#chatWindow").removeClass("closed");
	$("#chatWindow").addClass("opened");
	$(this).fadeOut();
});

$("#close-chat").click(function () {
	$("#open-chat").fadeIn();
	$("#chatWindow").removeClass("opened");
	$("#chatWindow").addClass("closed");
});

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
					username: cookieValue("username")
				});
			}
		}
	}

	// Rescale textarea and chat
	$(this).css("height", "unset").height(this.scrollHeight - 10);
	chatRescaleContent();
});

function typingTimeout() {
	let user = cookieValue("username");
	typing = false;
	socket.emit("typing", {user: user, typing: false});
}

socket.on("update-users", (users) => {
	$("#users").empty();
	for (var i = 0; i < users.length; i++) {
		let username = document.createElement("p");
		username.innerText = users[i];
		if (users[i] !== cookieValue("username")) {
			$("#users").append(username);
		}
	}
});

$("#user-name").on("focusout", function (event) {
	var name = $(this).text();
	document.cookie = "username=" + name;
	socket.emit("change-user-list", {boardId: windowBoardId, name: cookieValue("username")});
});


