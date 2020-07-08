let colors = ["#FFC8C8", "#FFFDCA", "#CDF4FF", "#EAD4FF"];

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
