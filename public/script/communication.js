let typing = false,
	timeout = undefined,
	messageCount = 0;
let userList = [];


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
	//$("#chatHeader").click(closeChat);
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
/*
$("#user-list-button").on("click", function(){
	let list = document.getElementById("users");
	if (list.style.display != "none"){
		list.setAttribute("style", "display: none;");
		//list.style.display = "none";
	}
	else {list.setAttribute("style", "display: inline;");}
	console.log("user-list");
});*/

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
	userList.length = 0;
	for (let i = 0; i < users.length; i++) {
		userList.push(users[i]);
	}
});

$("#user-name").on("focusout", function (event) {
	var name = $(this).text();
	document.cookie = "username=" + name;
	socket.emit("change-user-list", {boardId: windowBoardId, name: cookieValue("username")});
});

$(document).ready(function(){
	$(".pop-user-list").popover({
		placement: "top",
		trigger: "hover",
		html: true,
		content: function(){
			let result = $();
			for (let i = 0; i< userList.length; i++){
				result = result.add("<p>" + userList[i] + "</p>");
			}
			return result;
		}
	});
});

