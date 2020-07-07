function addComments(card, data) {
	card.append(createCommentBox());
	prependComments(card, data);

	function createCommentBox() {
		const commentBox = document.createElement("div");
		commentBox.className = "comments-box neu-float-panel";
		commentBox.innerHTML = "<div class='comments-box_header'>Comments<span class='close-commentBox'>&times;</span></div><div class='commentField flex-container'></div><input placeholder='Type a comment...' class='commentInput neu-input'>";
		return commentBox;
	}

	function prependComments(card, data) {
		let comments = data.comments;
		for (let i = 0; i < comments.length; i++) {
			const commentContainer = addComment(comments[i]);
			card.querySelector(".commentField").prepend(commentContainer);
		}
	}
}

function addComment(comment) {
	const commentContainer = document.createElement("div");
	commentContainer.className = "comment-container";
	const date = new Date(comment.timestamp);
	const dateString = months[date.getMonth() - 1] + " " + add0(date.getDate()) + ", " + date.getFullYear() + " at " + formatHours(date.getHours(), date.getMinutes());
	commentContainer.innerHTML = "<div class='comment-head'><p class='senderName'>" + comment.sender + "</p><p class='timestamp'>" + dateString + "</p></div><p class='commentMessage'>" + comment.message + "</p>";
	return commentContainer;
}

socket.on("comment", (data) => {
	const commentContainer = addComment(data);
	document.getElementById(data.cardId).querySelector(".commentField").prepend(commentContainer);
});


