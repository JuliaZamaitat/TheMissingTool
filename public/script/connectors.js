// Get center coordinates of element
function getCenter(el) {
	//Eventually consider zoom for calculations
	let zoom = document.getElementById("overlay").style.zoom;
	if (!zoom)
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
		const h = deleteConnectorBtn.height() / 2, w = deleteConnectorBtn.width() / 2;
		deleteConnectorBtn.css({top: e.clientY - h, left: e.clientX - w});
		deleteConnectorBtn.on("click", function (e) {
			if (e.which === 1) {
				socket.emit("delete-connector", selectedConnector);
				deleteConnectorById(selectedConnector);
				deleteConnectorBtn.trigger("mouseleave");
			}
		});
	});
}

$("#connector .line").on("mouseleave", function (e) {
	deleteConnectorBtn.trigger("mouseleave");
});
deleteConnectorBtn.on("mouseenter", function (e) {
	deleteConnectorBtn.css("display", "inline");
});
deleteConnectorBtn.on("mouseleave", function (e) {
	deleteConnectorBtn.css("display", "none");
});

// Observer to recalculate all connectors on zoom change
let observer = new MutationObserver(() => {
	document.getElementById("connectors").childNodes.forEach(function (c) {
		let fromCardCenter = getCenter(document.getElementById(c.dataset.from));
		let toCardCenter = getCenter(document.getElementById(c.dataset.to));
		c.style = calcLineStyleFromCoords(fromCardCenter.x, fromCardCenter.y, toCardCenter.x, toCardCenter.y);
	});
});
observer.observe(document.getElementById("overlay"), {attributeFilter: ["style"]});

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
	if (c === null) return;
	c.parentNode.removeChild(c);
}

// Delete all connectors attached to this card
function deleteConnectorsByCardId(cardId) {
	getConnectorsByCardId(cardId).forEach(c => {
		c.parentNode.removeChild(c);
	});
}


socket.on("add-connector", connector => {
	connector = JSON.parse(connector);
	drawConnector(connector._id, connector.from, connector.to);
});

socket.on("delete-connector", connectorId => {
	deleteConnectorById(connectorId);
});

