let colors = ["#FFC8C8", "#FFFDCA", "#CDF4FF", "#EAD4FF"];

function getRandomColor() {
	return colors[Math.floor(Math.random() * Math.floor(colors.length))];
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

function addColor(card, data) {
	card.classList.add(data.shape.toLowerCase());
	if (data.shape !== "TRIANGLE") {
		card.style.backgroundColor = data.backgroundColor;
	} else {
		card.style.color = data.backgroundColor;
	}
}

(function () {
	for (let i = 0; i < colors.length; i++) {
		const button = "<button class='color-btn' id='" + colors[i] + "' style='background-color:" + colors[i] + "'></button>";
		$(".color-options").each(function () {
			$(this).append(button);
		});
	}
})();
