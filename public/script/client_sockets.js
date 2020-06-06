let url = window.location.href;
let windowBoardId = url.substr(url.lastIndexOf("/") + 1);
let port;

$.get("/port", function (data) { //set the port dynamically
	port = data;
});

var socket = io();
socket.emit("join", windowBoardId);

$.get("/board/" + windowBoardId + "/messages", (messages) => {
	messages.forEach(addMessage);
});

$.get("/board/" + windowBoardId + "/cards", (cards) => {
	cards.forEach(createCard);
});


function createCard(data) {
	const card = document.createElement("div");
	card.className = "item animate";
	card.innerHTML = "<div class='buttonContainer'><span type='button' class='deleteBtn rounded'><i class='fa fa-trash-o'></i></span><span type='button' class='commentBtn rounded'><i class='fa fa-comments'></i></span></div><textarea type='text' value=''></textarea><div class='comments-box'><span class='close-commentBox'>&times;</span><div class='commentField'></div><input placeholder='Add a comment...' class='commentInput'></div>";
	card.id = data._id;
	if (data.position.left !== null && data.position.right !== null) {
		card.style.left = data.position.left + "px";
		card.style.top = data.position.top + "px";
	} else {
		card.style.left = 200 + "px";
		card.style.top = 200 + "px";
	}
	card.style.fontSize = data.fontSize;
	card.style.backgroundColor = data.backgroundColor;
	if (data.text != null) {
		card.querySelector("textarea").value = data.text; //Show the card text if defined
	}

	let comments = data.comments;
	for (let i = comments.length - 1; i > 0; i--) {
		const comment = document.createElement("div");
		comment.innerHTML = "<div class='comment-container'><p class='senderName'>" + comments[i].sender + "</p><p class='commentMessage'>" + comments[i].message + "</p><p class='timestamp'>" + new Date(comments[i].timestamp).toGMTString() + "</p></div>";
		card.querySelector(".commentField").appendChild(comment);
	}


	if (data.type === "LINK") {
		card.className = "item animate";
		card.innerHTML = "<div class='buttonContainer'><span type='button' class='link rounded'><i class='fa fa-link'></i></span><span type='button' class='deleteBtn rounded'><i class='fa fa-trash-o'></i></span><span type='button' class='commentBtn rounded'><i class='fa fa-comments'></i></span></div><textarea type='text' value=''></textarea><div class='comments-box'><span class='close-commentBox'>&times;</span><div class='commentField'></div><input placeholder='Add a comment...' class='commentInput'></div>";
		addLinkListeners(card);
	}

	addListeners(card);
	document.getElementById("overlay").appendChild(card);
}

function addLinkListeners(card) {
	// Add listener for forwarding to new board

	let querySelector = card.querySelector(".link");
	querySelector.addEventListener("mousedown", function (event) {
		$.get("/get-linked-board/" + card.id, function (data, status) {
			if (data !== null && data !== "") {
				location.href = "/board/" + data;
			} else {
				console.log("No boardId returned");
			}
		});
	});
}

function addListeners(card) {
	// Moving card listener
	let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	card.onmousedown = cardMouseDown;

	function cardMouseDown(e) {
		card.classList.remove("animate");
		card.style.position = "absolute";
		card.style.zIndex = 1000;
		document.getElementById("overlay").append(card);
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragCard;
		document.onmousemove = dragCard;
	}

	function dragCard(e) {
		e.preventDefault();
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		card.style.top = (card.offsetTop - pos2) + "px";
		card.style.left = (card.offsetLeft - pos1) + "px";
	}

	function closeDragCard() {
		sendPosChange({
			_id: card.id,
			position: {
				left: card.style.left.replace(/\D/g, ""),
				top: card.style.top.replace(/\D/g, ""),
			}
		});
		document.onmouseup = null;
		document.onmousemove = null;

	}

	function sendPosChange(update) {
		socket.emit("update-pos", update);
	}

	card.ondragstart = function () {
		return false;
	};

	// Delete card listener
	card.querySelector(".deleteBtn").addEventListener("mousedown", function (event) {
		event.stopPropagation();  //prevent bubbling process so the whole card doesn't start dragging
		const cardToDelete = {_id: event.currentTarget.parentElement.parentElement.id};
		socket.emit("delete-card", cardToDelete);
	});

	// Show chat
	card.querySelector(".commentBtn").addEventListener("mousedown", function () {
		$("#" + card.id + " .comments-box").fadeIn();
	});

	card.querySelector(".commentInput").addEventListener("keydown", function (e) {
		if ((e.keyCode === 10 || e.keyCode === 13)) {
			if (!e.shiftKey) {
				sendComment({
					cardId: card.id,
					message: $(this).val(),
					sender: cookieValue("username")
				});
				card.querySelector(".commentInput").value = "";
			}
		}
	});

	card.querySelector(".close-commentBox").addEventListener("mousedown", function () {
		$("#" + card.id + " .comments-box").fadeOut();
	});

	// Change text of card listener
	card.querySelector("textarea").addEventListener("input", function (event) {
		socket.emit("update-text", {
			_id: event.currentTarget.parentElement.id,
			text: event.currentTarget.value
		});
	});
}

// event listeners for board
$("#board-name").on("input", function (event) {
	console.log("In Ajax ");
	socket.emit("update-board-name", {
		_id: windowBoardId,
		name: event.currentTarget.value
	});
});


$("#share-board").on("click", shareBoard);
$("#delete-board").on("click", deleteBoard);
$("#export-board").on("click", exportBoard);

function shareBoard() {
	// TODO
}

function deleteBoard() {
	socket.emit("delete-board", {_id: windowBoardId});
}

function exportBoard() {
	// TODO
}

// event listener for toolbar buttons
$("#plus").click(() => {
	socket.emit("save-card", {
		color: getRandomColor()
	});
});

$("#plus-link").click(() => {
	var linkId = prompt("please enter your link-id", "");
	socket.emit("save-card", {
		color: getRandomColor(),
		type: "LINK",
		linkId: linkId
	});
});

//Send mere message to server, without username and time
function sendMessage(message) {
	socket.emit("message", message);
}

function sendComment(comment) {
	socket.emit("comment", comment);
}

// listening to web-sockets
socket.on("new-card", (data) => {
	const card = JSON.parse(data);
	createCard(card);
});

socket.on("pos-update", (data) => {
	const card = JSON.parse(data);
	let cardById = document.getElementById(card._id);
	cardById.style.left = card.position.left + "px";
	cardById.style.top = card.position.top + "px";
});

socket.on("text-update", (data) => {
	const card = JSON.parse(data);
	$("#" + card._id).find("textarea").val(card.text);
});

socket.on("delete-card", (data) => {
	const card = JSON.parse(data);
	$("#" + card._id).remove(); //remove the card element by its ID
});

socket.on("board-name-update", (data) => {
	console.log("Im Update");
	const name = JSON.parse(data).name;
	$("#board-name").val(name);
	$("#board-name").css("width", name.length / 1.5 + "rem");
});

$("#user-name").on("focusout", function (event) {
	var name = event.currentTarget.value;
	document.cookie = "username=" + name;
});

socket.on("board-deleted", (data) => {
	alert("Board deleted");
	location.href = "/";
});

socket.on("comment", (data) => {
	const comment = document.createElement("div");
	comment.innerHTML = "<p class='senderName'>" + data.sender + "</p><p class='commentMessage'>" + data.message + "</p><p class='timestamp'>" + new Date(data.timestamp).toGMTString() + "</p>";
	document.getElementById(data.cardId).querySelector(".commentField").appendChild(comment);
});

socket.on("message", addMessage);

function addMessage(message) {
	let usernameEl = $("<b>").text(message.username);
	let time = new Date(message.time);
	let timeEl = $("<span>", {class: "text-secondary float-right"}).text(time.getHours() + ":" + time.getMinutes());
	let messageHeadEl = $("<small>", {class: "messageHead"}).append(usernameEl, timeEl);
	let messageTextEl = $("<div>", {class: "messageText"}).text(message.text);
	let messageEl = $("<div>", {class: "message mt-2"}).append(messageHeadEl, messageTextEl);
	$("#chatContent").prepend(messageEl);
	chatRescaleContent();
	chatScrollBottom();
}

function getRandomColor() {
	var letters = "0123456789ABCDEF";
	var color = "#";
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function cookieValue(name) {
	return decodeURIComponent(document.cookie.split("; ").find(row => row.startsWith(name)).split("=")[1]);
}
