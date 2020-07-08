let selectedConnector = null;

// Left Toolbar
(function () {
	let color_picked = false;

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
})();

$(document).on("mousemove", function (event) {
	socket.emit("mouse-movement", {coords: {x: event.pageX, y: event.pageY}, username: window.username});
});

// Load cards
$.get("/board/" + window.windowBoardId + "/cards", (cards) => {
	cards.forEach(createCard);
	$.get("/board/" + window.windowBoardId + "/connectors", connectors => {
		connectors.forEach(function (connector) {
			drawConnector(connector._id, connector.from, connector.to);
		});
	});
});

function createCard(data) {
	const card = document.createElement("div");
	card.id = data._id;
	card.className = "item animate";

	// Color
	addColor(card, data);

	// Text
	card.innerHTML = "<textarea type='text' value=''></textarea>";
	card.style.fontSize = data.fontSize;
	if (data.text != null) {
		card.querySelector("textarea").value = data.text; //Show the card text if defined
	}
	card.querySelector("textarea").addEventListener("input", function (event) {
		socket.emit("update-text", {
			_id: event.currentTarget.parentElement.id,
			text: event.currentTarget.value
		});
	});

	// Buttons
	const buttons = document.createElement("div");
	buttons.className = "neu-float-panel buttonContainer";
	buttons.innerHTML = "<span type='button' class='neu-button plain link'><img src='/icons/link.svg'></span><span type='button' class='neu-button plain colorChangeBtn'><div class='colorChangeOptions'></div><img src='/icons/palette.svg'></span><span type='button' class='neu-button plain connectBtn'><img src='/icons/arrow-black.svg'></span><span type='button' class='neu-button plain commentBtn'><img src='/icons/comment.svg'></span><span type='button' class='neu-button plain deleteBtn'><img src='/icons/bin.svg'></span>";
	card.prepend(buttons);
	assignColorsToChange(card);
	addButtonListener();

	// Comments
	addComments(card, data);
	addCommentListeners();

	// Visitor
	const visitor = document.createElement("div");
	visitor.className = "visitorContainer";
	card.append(visitor);
	addFocusListener();

	// Position
	if (data.position.left !== null && data.position.right !== null) {
		card.style.left = data.position.left + "px";
		card.style.top = data.position.top + "px";
	} else {
		card.style.left = Math.floor(Math.random() * 301) + 100 + "px";
		card.style.top = Math.floor(Math.random() * 401) + 100 + "px";
	}
	addMovementListener();

	// Link
	if (data.linkId !== null && data.linkId !== undefined) {
		convertToLink(card);
	} else {
		addLinkListener();
	}

	// Append card
	document.getElementById("overlay").appendChild(card);

	function addMovementListener() {
		let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
		card.onmousedown = cardMouseDown;

		function cardMouseDown(e) {
			card.classList.remove("animate");
			card.style.position = "absolute";
			card.style.zIndex = 998;
			document.getElementById("overlay").append(card);
			pos3 = e.clientX;
			pos4 = e.clientY;
			document.onmouseup = closeDragCard;
			document.onmousemove = dragCard;
			adjustCardButtons();
		}

		function dragCard(e) {
			e.preventDefault();
			pos1 = pos3 - e.clientX;
			pos2 = pos4 - e.clientY;
			pos3 = e.clientX;
			pos4 = e.clientY;
			card.style.top = (card.offsetTop - pos2) + "px";
			card.style.left = (card.offsetLeft - pos1) + "px";
			adjustCardButtons();
			adjustCommentsBox();
			adjustConnectorsByCardId(card.id);
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
	}

	function addButtonListener() {
		card.querySelector(".connectBtn").addEventListener("mousedown", function (event) {
			event.stopPropagation();
			const card1 = event.currentTarget.parentElement.parentElement;
			const card1Center = getCenter(card1);

			// Line that continuously follows cursor until further action
			$(document).mousemove(e => {
				const connector = createLine(card1Center.x, card1Center.y, e.clientX, e.clientY);
				connector.id = "temp";
				$("#connectors + #temp").remove();
				$("#connectors").after(connector);
			});

			$(document).mousedown(e => {
				$(document).off("mousemove mousedown");
				elementMouseIsOver = document.elementFromPoint(e.clientX, e.clientY);
				while (elementMouseIsOver !== null && !elementMouseIsOver.classList.contains("item"))
					elementMouseIsOver = elementMouseIsOver.parentElement;
				const card2 = elementMouseIsOver;
				$("#connectors + #temp").remove();

				if (card2 !== null && card1.id !== card2.id) {
					const connector = {
						boardId: window.windowBoardId,
						from: card1.id,
						to: card2.id
					};
					socket.emit("add-connector", connector);
				}
			});
		});
		card.querySelector(".deleteBtn").addEventListener("mousedown", function (event) {
			event.stopPropagation();
			const cardToDelete = {_id: event.currentTarget.parentElement.parentElement.id};
			socket.emit("delete-card", cardToDelete);
		});
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

	function adjustCardButtons() {
		let colorChangeOptions = buttons.querySelector(".colorChangeOptions");
		let buttonsFullHeight = $(".buttonContainer").outerHeight(true);
		let cardTop = card.getBoundingClientRect().top - (data.shape !== "TRIANGLE" ? 0.3 : 0) * card.clientHeight;
		if (cardTop - 2.2 * buttonsFullHeight < 0) {
			colorChangeOptions.style.top = "3.5rem";
			colorChangeOptions.style.bottom = "auto";
			if (cardTop - buttonsFullHeight < 0) {
				buttons.style.bottom = data.shape !== "TRIANGLE" ? "-6.5rem" : "-6rem";
				buttons.style.top = "auto";
			} else {
				buttons.style.bottom = "auto";
				buttons.style.top = data.shape !== "TRIANGLE" ? "-6.5rem" : "-2rem";
			}
		} else {
			colorChangeOptions.style.top = "auto";
			colorChangeOptions.style.bottom = "3.5rem";
		}
	}

	function addCommentListeners() {
		card.querySelector(".commentBtn").addEventListener("mousedown", function () {
			$("#" + card.id + " .comments-box").fadeIn();
			adjustCommentsBox();
		});
		card.querySelector(".commentInput").addEventListener("keydown", function (e) {
			if ((e.keyCode === 10 || e.keyCode === 13)) {
				if (!e.shiftKey) {
					socket.emit("comment", {
						cardId: card.id,
						message: $(this).val(),
						sender: window.username
					});
					card.querySelector(".commentInput").value = "";
				}
			}
		});
		card.querySelector(".close-commentBox").addEventListener("mousedown", function () {
			$("#" + card.id + " .comments-box").fadeOut();
			adjustCardButtons();
		});
	}

	function adjustCommentsBox() {
		let commentsBox = card.querySelector(".comments-box");
		if (card.getBoundingClientRect().top - $(".comments-box").outerHeight(true) < 0) {
			commentsBox.style.top = "120%";
			commentsBox.style.bottom = "auto";
		} else {
			commentsBox.style.top = "auto";
			commentsBox.style.bottom = data.shape !== "TRIANGLE" ? "120%" : "85%";
		}
	}

	function addFocusListener() {
		if (data.shape === "TRIANGLE") {
			card.addEventListener("mousedown", function (e) {
				setTimeout(function () {
					card.querySelector("textarea").focus();
				}, 100);
			});
		}
		card.querySelector("textarea").addEventListener("focusin", function () {
			socket.emit("focus-in", {cardId: card.id, username: window.username});
		});
		card.querySelector("textarea").addEventListener("focusout", function () {
			socket.emit("focus-out", {cardId: card.id, username: window.username});
		});
	}

	function addLinkListener() {
		let querySelector = card.querySelector(".link");
		querySelector.addEventListener("mousedown", function () {
			$.post("/board/" + window.windowBoardId,
				function (boardId) {
					socket.emit("add-link", {linkId: boardId, cardId: card.id});
				});
		});
	}

}

function convertToLink(card) {
	const newBoardName = card.querySelector("textarea").value;
	if (newBoardName.length == 0) {
		document.onmouseup = null;
		document.onmousemove = null;
		alert("Please enter a name for the new board on the card.");
	} else if (newBoardName.length >= 201) {
		document.onmouseup = null;
		document.onmousemove = null;
		alert("Board name cannot be longer than 200 characters.");
	} else {
		card.classList.add("link-card");
		if (card.querySelector(".link")) card.querySelector(".link").remove();
		const element = document.createElement("button");
		element.type = "button";
		element.className = "forward";
		element.innerHTML = "<img src='/icons/external-link.svg'>";
		card.appendChild(element);
		// Listener for forwarding to new board
		card.querySelector(".forward").addEventListener("mousedown", function () {
			$.get("/get-linked-board/" + card.id, function (data) {
				if (data !== null && data !== "") {
					const newBoardId = data;
					socket.emit("update-board-name", {
						_id: newBoardId,
						name: newBoardName
					});
					console.log(newBoardId);
					forwardToBoard(newBoardId);
				}
			});
		});
	}
}

// Listening to sockets
socket.on("new-card", (data) => {
	const card = JSON.parse(data);
	createCard(card);
});

socket.on("pos-update", (data) => {
	const card = JSON.parse(data);
	let cardById = document.getElementById(card._id);
	cardById.style.left = card.position.left + "px";
	cardById.style.top = card.position.top + "px";
	adjustConnectorsByCardId(card._id);
});

socket.on("delete-card", (data) => {
	const card = JSON.parse(data);
	$("#" + card._id).remove();
	deleteConnectorsByCardId(card._id);
});

socket.on("text-update", (data) => {
	const card = JSON.parse(data);
	$("#" + card._id).find("textarea").val(card.text);
});

socket.on("color-update", (data) => {
	const card = JSON.parse(data);
	let elementById = document.getElementById(card._id);
	if (!elementById.classList.contains("triangle")) {
		elementById.style.backgroundColor = card.backgroundColor;
	} else {
		elementById.style.color = card.backgroundColor;
	}

});

socket.on("card-to-link", (data) => {
	const card = document.getElementById(data);
	convertToLink(card);
});

socket.on("display-card", (data) => {
	createCard(data);
});

socket.on("remove-card", (cardId) => {
	document.getElementById(cardId).remove();
	deleteConnectorsByCardId(cardId);
});

socket.on("mouse-movement", (data) => {
	var el = getCursorElement(data);
	el.style.left = data.coords.x + "px";
	el.style.top = data.coords.y + "px";
	$("body").append(el);
});
