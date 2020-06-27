let selectedConnector = null;

$.get("/board/" + window.windowBoardId + "/cards", (cards) => {
	cards.forEach(createCard);
	$.get("/board/" + window.windowBoardId + "/connectors", connectors => {
		connectors.forEach(function(c) {
			drawConnector(c._id, c.from, c.to);
		});
	});
});

window.addEventListener("pageshow", function (event) {
	const historyTraversal = event.persisted ||
		(typeof window.performance != "undefined" &&
			window.performance.navigation.type === 2);
	if (historyTraversal) {
		window.location.reload();
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

	card.innerHTML = "<textarea type='text' value=''></textarea>";

	const buttons = document.createElement("div");
	buttons.className = "neu-float-panel buttonContainer";
	buttons.innerHTML = "<span type='button' class='neu-button plain link'><img src='/icons/link.svg'></span><span type='button' class='neu-button plain colorChangeBtn'><div class='colorChangeOptions'></div><img src='/icons/palette.svg'></span><span type='button' class='neu-button plain connectBtn'><img src='/icons/arrow-black.svg'></span><span type='button' class='neu-button plain commentBtn'><img src='/icons/comment.svg'></span><span type='button' class='neu-button plain deleteBtn'><img src='/icons/bin.svg'></span>";

	var commentBox = createCommentBox();

	const visitor = document.createElement("div");
	visitor.className = "visitorContainer";

	card.prepend(buttons);
	card.append(commentBox);
	card.append(visitor);
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

	addComments(data, card);

	if (data.linkId !== null && data.linkId !== undefined) {
		convertToLink(card);

	} else {
		let querySelector = card.querySelector(".link");
		querySelector.addEventListener("mousedown", function () {
			$.post("/board/" + window.windowBoardId,
				function (boardId) {
					socket.emit("add-link", {linkId: boardId, cardId: card.id});
				});
		});
	}
	addCardListeners(card, data);
	document.getElementById("overlay").appendChild(card);

	//Flip card elements to the bottom side if the card is too high up
	function adjustCardButtons() {
		let colorChangeOptions = buttons.querySelector(".colorChangeOptions");
		let buttonsFullHeight = $(".buttonContainer").outerHeight(true);
		if(card.getBoundingClientRect().top - 2.2*buttonsFullHeight < 0) {
			colorChangeOptions.style.top = "3.5rem";
			colorChangeOptions.style.bottom = "auto";
			if(card.getBoundingClientRect().top - buttonsFullHeight < 0) {
				buttons.style.bottom = "-6.5rem";
				buttons.style.top = "auto";
			} else {
				buttons.style.bottom = "auto";
				buttons.style.top = "-6.5rem";
			}
		} else {
			colorChangeOptions.style.top = "auto";
			colorChangeOptions.style.bottom = "3.5rem";
		}
	}
	function adjustCommentsBox() {
		let commentsBox = card.querySelector(".comments-box");
		if(card.getBoundingClientRect().top - $(".comments-box").outerHeight(true) < 0) {
			commentsBox.style.top = "120%";
			commentsBox.style.bottom = "auto";
		} else {
			commentsBox.style.top = "auto";
			commentsBox.style.bottom = "120%";
		}
	}

	function addCardListeners(card, data) {

		// Focus listeners
		card.querySelector("textarea").addEventListener("focusin", function () {
			socket.emit("focus-in", {cardId: card.id, username: window.username});
		});
		card.querySelector("textarea").addEventListener("focusout", function () {
			socket.emit("focus-out", {cardId: card.id, username: window.username});
		});

		// Moving card listener
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

		// Connect card listener
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
				while(elementMouseIsOver !== null && !elementMouseIsOver.classList.contains("item"))
					elementMouseIsOver = elementMouseIsOver.parentElement;
				const card2 = elementMouseIsOver;
				$("#connectors + #temp").remove();

				if(card2 !== null && card1.id !== card2.id) { // If neither aborted nor connected to same card
					const connector = {
						boardId: window.windowBoardId,
						from: card1.id,
						to: card2.id
					};
					socket.emit("add-connector", connector);
				}
			});
		});

		// Delete card listener
		card.querySelector(".deleteBtn").addEventListener("mousedown", function (event) {
			event.stopPropagation();  //prevent bubbling process so the whole card doesn't start dragging
			const cardToDelete = {_id: event.currentTarget.parentElement.parentElement.id};
			socket.emit("delete-card", cardToDelete);
		});

		// Show comment
		card.querySelector(".commentBtn").addEventListener("mousedown", function () {
			$("#" + card.id + " .comments-box").fadeIn();
			adjustCommentsBox();
		});

		card.querySelector(".commentInput").addEventListener("keydown", function (e) {
			if ((e.keyCode === 10 || e.keyCode === 13)) {
				if (!e.shiftKey) {
					sendComment({
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
}

// Get center coordinates of element
function getCenter(el) {
	//Eventually consider zoom for calculations
	let zoom = document.getElementById("overlay").style.zoom;
	if(!zoom)
		zoom = 1;
	else
		zoom = zoom.replace("%", "") / 100;
	let width = el.clientWidth | $(el).outerWidth(), //Special cases for triangle shape
		height = el.clientHeight | $(el).outerHeight(),
		offsetLeft = el.offsetLeft,
		offsetTop = el.offsetTop;
	return {
		x: zoom * (offsetLeft + width / 2),
		y: zoom * (offsetTop + height / 2)
	};
}

// Calculate styling for a potential line, given the coordinates
function calcLineStyleFromCoords(x1, y1, x2, y2) {
	let a = x1 - x2,
		b = y1 - y2,
		length = Math.sqrt(a * a + b * b);
	let sx = (x1 + x2) / 2,
		sy = (y1 + y2) / 2;
	let x = sx - length / 2,
		y = sy;
	let angle = Math.PI - Math.atan2(-b, a);

	return "width: " + length + "px; "
				+ "-moz-transform: rotate(" + angle + "rad); "
				+ "-webkit-transform: rotate(" + angle + "rad); "
				+ "-o-transform: rotate(" + angle + "rad); "
				+ "-ms-transform: rotate(" + angle + "rad); "
				+ "top: " + y + "px; "
				+ "left: " + x + "px; ";
}

// Create a line with the necessary syling
function createLine(x1, y1, x2, y2) {
	let line = document.createElement("div");
	line.classList.add("line");
	let styles = calcLineStyleFromCoords(x1, y1, x2, y2);
	line.setAttribute("style", styles);
	return line;
}

let deleteConnectorBtn = $("#deleteConnectorBtn");
// Draw connector between two cards
function drawConnector(id, from, to) {
	let card1 = document.getElementById(from);
	let card2 = document.getElementById(to);
	let card1Center = getCenter(card1);
	let card2Center = getCenter(card2);

	let connectorEl = createLine(card1Center.x, card1Center.y, card2Center.x, card2Center.y);
	connectorEl.setAttribute("data-from", card1.id);
	connectorEl.setAttribute("data-to", card2.id);
	connectorEl.id = id;

	$("#connectors").append(connectorEl);
	$(connectorEl).hover(e => {
		deleteConnectorBtn.trigger("mouseenter");
		selectedConnector = id;
		const h = deleteConnectorBtn.height()/2, w = deleteConnectorBtn.width()/2;
		deleteConnectorBtn.css({ top:  e.clientY - h, left:  e.clientX - w });
		deleteConnectorBtn.on("click", function(e) {
			if(e.which === 1) {
				socket.emit("delete-connector", selectedConnector);
				deleteConnectorById(selectedConnector);
				deleteConnectorBtn.trigger("mouseleave");
			}
		});
	});
}

$("#connector .line").on("mouseleave", function(e) {
	deleteConnectorBtn.trigger("mouseleave");
});
deleteConnectorBtn.on("mouseenter", function(e) {
	deleteConnectorBtn.css("display", "inline");
});
deleteConnectorBtn.on("mouseleave", function(e) {
	deleteConnectorBtn.css("display", "none");
});

// Observer to recalculate all connectors on zoom change
let observer = new MutationObserver(() => {
	document.getElementById("connectors").childNodes.forEach(function(c) {
		let fromCardCenter = getCenter(document.getElementById(c.dataset.from));
		let toCardCenter = getCenter(document.getElementById(c.dataset.to));
		c.style = calcLineStyleFromCoords(fromCardCenter.x, fromCardCenter.y, toCardCenter.x, toCardCenter.y);
	});
});
observer.observe(document.getElementById("overlay"), { attributeFilter : ["style"] });

// Get all connectors attached to this card
function getConnectorsByCardId(cardId) {
	return document.querySelectorAll(".line[data-from='" + cardId + "'],.line[data-to='" + cardId + "']");
}

// Recalculate all connectors attached to this card
function adjustConnectorsByCardId(cardId) {
	getConnectorsByCardId(cardId).forEach(c => {
		let otherCardId = c.dataset.from == cardId ? c.dataset.to : c.dataset.from;
		let cardCenter = getCenter(document.getElementById(cardId));
		let otherCardCenter = getCenter(document.getElementById(otherCardId));
		c.style = calcLineStyleFromCoords(cardCenter.x, cardCenter.y, otherCardCenter.x, otherCardCenter.y);
	});
}

// Delete a connector by its ID
function deleteConnectorById(id) {
	let c = document.getElementById(id);
	if(c === null) return;
	c.parentNode.removeChild(c);
}

// Delete all connectors attached to this card
function deleteConnectorsByCardId(cardId) {
	getConnectorsByCardId(cardId).forEach(c => {
		c.parentNode.removeChild(c);
	});
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
	adjustConnectorsByCardId(card._id);
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
	deleteConnectorsByCardId(card._id); //remove all connectors associated with card
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
	deleteConnectorsByCardId(cardId); //remove all connectors associated with card
});

$(document).on("mousemove", function (event) {
	socket.emit("mouse_movement", {coords: {x: event.pageX, y: event.pageY}, username: window.username});
});

socket.on("all_mouse_movements", (data) => {
	var el = getCursorElement(data);
	el.style.left = data.coords.x + "px";
	el.style.top = data.coords.y + "px";
	$("body").append(el);
});

socket.on("add-connector", connector => {
	connector = JSON.parse(connector);
	drawConnector(connector._id, connector.from, connector.to);
});

socket.on("delete-connector", connectorId => {
	deleteConnectorById(connectorId);
});
