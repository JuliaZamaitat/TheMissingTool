//Adjust chat content height, in case input height changes
const chatRescaleContent = () => {
	$("#chatContent").css("height", "calc(100% - " + $("#chatInputContainer").outerHeight() + "px)");
};

//Scroll to bottom
const chatScrollBottom = () => {
	$("#chatContent").scrollTop(chatContent.scrollHeight);
};

//Chat window's open/close mechanism
$("#chatHeader").click(() => {
	$("#chatInputContainer").fadeToggle(300);
	$("#chatBody").slideToggle();
	chatRescaleContent();
	chatScrollBottom();
});

//Listens for chat keyboard input
$("#chatInput").on("input keydown", function(e) {
	if((e.keyCode == 10 || e.keyCode == 13)) { //If Enter is pressed
		if (!e.shiftKey) { //If Shift is not pressed
			e.preventDefault(); //Prevent new line
			let text = $.trim($("#chatInput").val()); //Get input
			if(text !== "") { //If it's not empty
				let time = Date.now(); //Timestamp in ms
				//Clear textarea
				$("#chatInput").val("");
				//Send message without username
				sendMessage({
					text: text,
					time: time,
					boardId: windowBoardId
				});
			}
		}
	}

	//Rescale textarea and chat
	$(this).css("height", "unset").height(this.scrollHeight-10);
	chatRescaleContent();
});
