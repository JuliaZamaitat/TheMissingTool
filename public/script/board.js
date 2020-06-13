window.onload = function () {
	//If the modal for the board name is rendered then show it
	if($("#setNameModal")) {
		$("#setNameModal").modal("show");
		//Keep submit button disabled as long as input is empty
		$("#board-name-input").on("input", () => {
			$("#board-name-button").prop("disabled", !$("#board-name-input").val().trim());
		});
	}
	//Update board name via modal
	$("#board-name-form").submit(e => {
		e.preventDefault();
		$("#setNameModal").modal("hide");
		updateBoardName($("#board-name-input").val().trim());
	});

	$("#create-board").on("click", createBoard);
	$("#share-board").on("click", copyToClipboard);
};

function createBoard() {
	$.post("/",
		function (data) {
			location.href = "/board/" + data;
		});
}

function copyToClipboard() {
	// need temp since for .execCommand item needs to be selected before and
	// window.location.href can not be selected
	const temp = document.createElement("input"), text = window.location.href;
	document.body.appendChild(temp);
	temp.value = text;
	temp.select();
	document.execCommand("copy");
	document.body.removeChild(temp);

	$(".notifier").toggleClass("active");
	setTimeout(function () {
		$(".notifier").removeClass("active");
	}, 1000);
}
