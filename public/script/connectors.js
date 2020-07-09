function getCenter(el) {
	const width = el.clientWidth | $(el).outerWidth(),
		height = el.clientHeight | $(el).outerHeight(),
		offsetLeft = el.offsetLeft,
		offsetTop = el.offsetTop;
	return {
		x: offsetLeft + width / 2,
		y: offsetTop + height / 2
	};
}

function calcLineStyleFromCoords(x1, y1, x2, y2) {
	const a = x1 - x2,
		b = y1 - y2,
		length = Math.sqrt(a * a + b * b),
		sx = (x1 + x2) / 2,
		sy = (y1 + y2) / 2,
		x = sx - length / 2,
		y = sy,
		angle = Math.PI - Math.atan2(-b, a);

	return "width: " + length + "px; "
		+ "-moz-transform: rotate(" + angle + "rad); "
		+ "-webkit-transform: rotate(" + angle + "rad); "
		+ "-o-transform: rotate(" + angle + "rad); "
		+ "-ms-transform: rotate(" + angle + "rad); "
		+ "top: " + y + "px; "
		+ "left: " + x + "px; ";
}

function createLine(x1, y1, x2, y2) {
	const line = document.createElement("div");
	line.classList.add("line");
	const styles = calcLineStyleFromCoords(x1, y1, x2, y2);
	line.setAttribute("style", styles);
	return line;
}

const deleteConnectorBtn = $("#deleteConnectorBtn");

function drawConnector(id, from, to) {
	const card1 = document.getElementById(from);
	const card2 = document.getElementById(to);
	const card1Center = getCenter(card1);
	const card2Center = getCenter(card2);
	const connectorEl = createLine(card1Center.x, card1Center.y, card2Center.x, card2Center.y);
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

function getConnectorsByCardId(cardId) {
	return document.querySelectorAll(".line[data-from='" + cardId + "'],.line[data-to='" + cardId + "']");
}

function adjustConnectorsByCardId(cardId) {
	getConnectorsByCardId(cardId).forEach(c => {
		const otherCardId = c.dataset.from == cardId ? c.dataset.to : c.dataset.from;
		const cardCenter = getCenter(document.getElementById(cardId));
		const otherCardCenter = getCenter(document.getElementById(otherCardId));
		c.style = calcLineStyleFromCoords(cardCenter.x, cardCenter.y, otherCardCenter.x, otherCardCenter.y);
	});
}

function deleteConnectorById(id) {
	const c = document.getElementById(id);
	if (c === null) return;
	c.parentNode.removeChild(c);
}

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

function addConnectListener(card) {
	card.querySelector(".connectBtn").addEventListener("mousedown", function (event) {
		event.stopPropagation();
		let card1 = event.currentTarget.parentElement.parentElement;
		const card1Center = getCenter(card1);
		let mousedown = false;
		$(document).mousemove(e => {
			if(!mousedown) {
				const connector = createLine(card1Center.x, card1Center.y, e.clientX, e.clientY);
				connector.id = "temp";
				$("#connectors + #temp").remove();
				$("#connectors").after(connector);
			}
		});

		$(document).mousedown(e => {
			mousedown = true;
			elementMouseIsOver = document.elementFromPoint(e.clientX, e.clientY);
			while (elementMouseIsOver !== null && !elementMouseIsOver.classList.contains("item"))
				elementMouseIsOver = elementMouseIsOver.parentElement;
			const card2 = elementMouseIsOver;
			$("#connectors + #temp").remove();

			if (card1 !== null && card2 !== null && card1.id !== card2.id) { // If neither aborted nor connected to same card
				const connector = {
					boardId: window.windowBoardId,
					from: card1.id,
					to: card2.id
				};
				socket.emit("add-connector", connector);
				card1 = null;
			}
		});
	});
}
