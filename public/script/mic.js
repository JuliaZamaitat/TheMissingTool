let muted = true;

//Mic' listener
$("#mic").click(e => {
	e.stopPropagation();
	$("#mic").toggleClass("fa-microphone fa-microphone-slash");
	muted = !muted;
	if(!muted) {
		record();
	}
});

function hasGetUserMedia() {
	return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

function record() {
	if (hasGetUserMedia()) {
		// Good to go!
		navigator.mediaDevices.getUserMedia({audio: true})
			.then(stream => {

			});
	} else {
		alert("Microphone is not supported in your browser");
	}
}
