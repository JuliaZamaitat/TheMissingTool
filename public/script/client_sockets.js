
const url = new URL(window.location.href);
let pathname = url.pathname.toString();
window.windowBoardId = pathname.substr(pathname.lastIndexOf("/") + 1);

let colors = ["#FFC8C8", "#FFFDCA", "#CDF4FF", "#EAD4FF"]; // cards colors scheme

//typing notification
let typing = false,
	timeout = undefined;
var socket = io();
var messageCount = 0;

$.get("/board/" + window.windowBoardId + "/messages", (messages) => {
	messages.forEach(addMessage);
	$("#messageCount").text(( messageCount = 0).toString());

});

$.get("/board/" + window.windowBoardId + "/cards", (cards) => {
	cards.forEach(createCard);
});

window.addEventListener( "pageshow", function ( event ) {

	const historyTraversal = event.persisted ||
		(typeof window.performance != "undefined" &&
			window.performance.navigation.type === 2);
	if ( historyTraversal ) {
		window.location.reload();
	}
});

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

function createCard(data) {
	const card = document.createElement("div");
	card.className = "item animate";

	card.style.backgroundColor = data.backgroundColor;
	card.classList.add(data.shape.toLowerCase());

	if (data.shape === "TRIANGLE") {
		card.style.borderColor = "transparent transparent " + data.backgroundColor + " transparent";
		card.style.backgroundColor = "transparent";
	}

	const buttons = document.createElement("div");
	buttons.className = "neu-float-panel buttonContainer";
	buttons.innerHTML = "<span type='button' class='neu-button plain link'><img src='/icons/link.webp'></span><span type='button' class='neu-button plain colorChangeBtn'><div class='colorChangeOptions'></div><img src='/icons/palette.webp'></span><span type='button' class='neu-button plain commentBtn'><img src='/icons/comment.webp'></span><span type='button' class='neu-button plain deleteBtn'><img src='/icons/bin.webp'></span>";
	card.innerHTML = "<textarea type='text' value=''></textarea><div class='comments-box'><span class='close-commentBox'>&times;</span><div class='commentField'></div><input placeholder='Add a comment...' class='commentInput'></div>";
	card.prepend(buttons);

	card.id = data._id;
	assignColorsToChange(card);

	if (data.position.left !== null && data.position.right !== null) {
		card.style.left = data.position.left + "px";
		card.style.top = data.position.top + "px";
	} else {
		card.style.left = Math.floor(Math.random() * 301) + 100 + "px";
		card.style.top = Math.floor(Math.random() * 401) + 100 + "px";
	}
	card.style.fontSize = data.fontSize;
	if (data.text != null) {
		card.querySelector("textarea").value = data.text; //Show the card text if defined
	}

	let comments = data.comments;
	for (let i = comments.length - 1; i > 0; i--) {
		const comment = document.createElement("div");
		comment.innerHTML = "<div class='comment-container'><p class='senderName'>" + comments[i].sender + "</p><p class='commentMessage'>" + comments[i].message + "</p><p class='timestamp'>" + new Date(comments[i].timestamp).toGMTString() + "</p></div>";
		card.querySelector(".commentField").appendChild(comment);
	}

	if (data.linkId !== null && data.linkId !== undefined) {
		convertToLink(card);

	} else {
		let querySelector = card.querySelector(".link");
		querySelector.addEventListener("mousedown", function (event) {
			$.post("/",
				function (boardId) {
					socket.emit("add-link", {linkId: boardId, cardId: card.id});
				});
		});
	}
	addListeners(card, data);
	document.getElementById("overlay").appendChild(card);
}

function convertToLink(card) {
	const link = card.querySelector(".link");
	if (card.querySelector(".link"))
		link.remove();
	const element = document.createElement("span");
	element.className = "forward";
	element.type = "button";
	element.innerHTML = "<i class='fa fa-arrow-right'></i>";
	card.append(element);
	// Listener for forwarding to new board
	card.querySelector(".forward").addEventListener("mousedown", function () {
		$.get("/get-linked-board/" + card.id, function (data) {
			if (data !== null && data !== "") {
				setCookieAndChangeLocation(data);
			} else {
				console.log("No boardId returned");
			}
		});
	});
}


function addListeners(card, data) {
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
		isOverlappingAny();
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

	function isOverlappingAny() {
		let allCards = document.getElementsByClassName("item");
		for (let i = 0; i < allCards.length; i++) {
			if (isOverlapping(allCards[i], card) === true) {
				let idFromOverlappingCard = allCards[i].id;
				if (idFromOverlappingCard !== card.id) {
					$.get("/get-linked-board/" + idFromOverlappingCard, function (linkedBoard) {
						if (linkedBoard !== null && linkedBoard !== "") {
							socket.emit("move-card", {cardId: card.id, boardId: linkedBoard});
						}
					});
				}
			}
		}
	}

	function isOverlapping(first, second) {
		if (first.length && first.length > 1) {
			first = first[0];
		}
		if (second.length && second.length > 1) {
			second = second[0];
		}
		const element1 = first instanceof Element ? first.getBoundingClientRect() : false;
		const element2 = second instanceof Element ? second.getBoundingClientRect() : false;

		let overlap = null;
		if (element1 && element2) {
			overlap = !(
				element1.right < element2.left ||
				element1.left > element2.right ||
				element1.bottom < element2.top ||
				element1.top > element2.bottom
			);
			return overlap;
		} else {
			return overlap;
		}
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

	// Change card color
	let colorButtons = card.querySelectorAll(".color-change-btn");
	colorButtons.forEach(function (btn) {
		btn.addEventListener("mousedown", function (event) {
			socket.emit("update-color", {
				_id: card.id,
				backgroundColor: event.currentTarget.id,
				shape: data.shape
			});
		});
	});
}

// event listeners for board
$("#board-name").on("input", function (event) {
	socket.emit("update-board-name", {
		_id: window.windowBoardId,
		name: $(this).text()
	});
});

$("#delete-board").on("click", deleteBoard);
$("#export-board").on("click", exportBoard);

function deleteBoard() {
	socket.emit("delete-board", {_id: window.windowBoardId});
}

function exportBoard() {
	// TODO
}

// event listener for toolbar buttons
assignColorsToCreate();
createCardOnClick();

function createCardOnClick() {
	var color_picked = false;

	$(".create-card-btn").each(function () {
		$(this).mousedown(() => {
			if (!color_picked) {
				socket.emit("save-card", {
					color: getRandomColor(),
					shape: $(this).attr("id")
				});
			} else {
				return;
			}
		}).mouseup(() => {
			color_picked = false;
		});
	});

	$(".color-btn").each(function () {
		$(this).mousedown(() => {
			color_picked = true;
			socket.emit("save-card", {
				color: $(this).attr("id"),
				shape: $(this).closest(".create-card-btn").attr("id")
			});
		});
	});
}

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

socket.on("color-update", (data) => {
	const card = JSON.parse(data);
	let elementById = document.getElementById(card._id);
	if (card.shape === "TRIANGLE") {
		elementById.style.borderColor = "transparent transparent " + card.backgroundColor + " transparent";
	} else {
		elementById.style.backgroundColor = card.backgroundColor;
	}

});

socket.on("delete-card", (data) => {
	const card = JSON.parse(data);
	$("#" + card._id).remove(); //remove the card element by its ID
});

socket.on("card-to-link", (data) => {
	const card = document.getElementById(data);
	convertToLink(card);
});

socket.on("board-name-update", (data) => {
	const name = JSON.parse(data).name;
	// $("#board-name").val(name);
	// $("#board-name").css("width", name.length / 1.5 + "rem");
});

$("#user-name").on("focusout", function (event) {
	var name = $(this).text();
	document.cookie = "username=" + name;
	socket.emit("change-user-list", {boardId: windowBoardId, name: cookieValue("username")});
});

socket.on("board-deleted", (data) => {
	location.href = "/";
});

socket.on("comment", (data) => {
	const comment = document.createElement("div");
	comment.innerHTML = "<p class='senderName'>" + data.sender + "</p><p class='commentMessage'>" + data.message + "</p><p class='timestamp'>" + new Date(data.timestamp).toGMTString() + "</p>";
	document.getElementById(data.cardId).querySelector(".commentField").appendChild(comment);
});

socket.on("display-card", (data) => {
	createCard(data);
});


socket.on("remove-card", (data) => {
	document.getElementById(data).remove();
});

socket.on("message", addMessage);

function addMessage(message) {
	$("#messageCount").text(( ++messageCount).toString());
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
	return colors[Math.floor(Math.random() * Math.floor(colors.length))];
}

function assignColorsToCreate() {
	for (var i = 0; i < colors.length; i++) {
		var button = "<button class='color-btn' id='" + colors[i] + "' style='background-color:" + colors[i] + "'></button>";

		$(".color-options").each(function () {
			$(this).append(button);
		});
	}
}

function assignColorsToChange(card) {
	for (var i = 0; i < colors.length; i++) {
		var colorButton = document.createElement("button");
		colorButton.className = "color-change-btn";
		colorButton.id = colors[i];
		colorButton.style.backgroundColor = colors[i];

		card.querySelector(".colorChangeOptions").append(colorButton);
	}
}

function cookieValue(name) {
	let rightRow = document.cookie.split("; ").find(row => row.startsWith(name));
	if (rightRow !== null && rightRow !== undefined) {
		return decodeURIComponent(rightRow.split("=")[1]);
	} else {
		return null;
	}
}

function typingTimeout() {
	let user = cookieValue("username");
	typing = false;
	socket.emit("typing", {user: user, typing: false});
}

//listen for keypress in chatinput and emits typing
$(document).ready(function () {


	socket.emit("join", {boardId: window.windowBoardId, name: cookieValue("username")});

	let currentBoards = cookieValue("visitedBoards");
	if (currentBoards !== null) {
		const arrayOfVisitedBoards = currentBoards.toString().split(",");
		if (arrayOfVisitedBoards !== null && arrayOfVisitedBoards !== undefined) {
			arrayOfVisitedBoards.forEach(element => {
				if (element !== null && element !== window.windowBoardId) {
					appendNameToBoardList(element);
				}
			});
		}
	}

	function appendNameToBoardList(boardId) {
		if (boardId !== null && boardId !== "") {
			$.get("/board/" + boardId + "/data", (boardData) => {
				if (boardData !== "") {
					var element = document.createElement("p");
					var text = document.createTextNode(boardData.name);
					element.appendChild(text);
					element.id = boardData._id;
					element.className = "boardLink";
					element.addEventListener("mousedown", function () {
						setCookieAndChangeLocation(element.id);
					});
					document.getElementById("dropdown-content").appendChild(element);

				}
			});
		}
	}

	socket.emit("join", {boardId: windowBoardId, name: cookieValue("username")});


	$("#chatInput").keypress((e) => {
		if (e.which != 13) {
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
		if (data.typing == true) {
			$("#notificationbox").text(data.user + ` is typing`);
			chatRescaleContent();
		} else {
			$("#notificationbox").text("");
			chatRescaleContent();
		}
	});
});
