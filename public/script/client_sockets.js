let url = window.location.href;
let windowBoardId = url.substr(url.lastIndexOf("/") + 1);
let port;

$.get("/port", function (data) { //set the port dynamically
    port = data;
});

var socket = io();
socket.emit("join", windowBoardId);

$.get("/board/" + windowBoardId + "/cards", (cards) => {
    cards.forEach(createCard);
});

function createCard(data) {
    const card = document.createElement("div");
    card.className = "item animate";
    card.innerHTML = "<span type='button' class='deleteBtn rounded'><i class='fa fa-trash-o'></i></span><span type='button' class='commentBtn rounded'><i class='fa fa-comments'></i></span><textarea type='text' value=''></textarea><pdiv class='comments'><p>Comments</p><div class='commentField'></div><input class='commentInput'></div>";
    card.id = data._id;
    if (data.position.left !== null && data.position.right !== null) {
        card.style.left = data.position.left + "px";
        card.style.top = data.position.top + "px";
    } else {
        card.style.left = 200 + "px";
        card.style.top = 200 + "px";
    }
    card.style.fontSize = data.fontSize;
    card.style.backgroundColor = data.backgroundColor;
    if (data.text != null) {
        card.querySelector("textarea").value = data.text; //Show the card text if defined
    }

    let comments = data.comments;
    for (let i = 0; i < comments.length; i++) {
        const comment = document.createElement("div");
        comment.innerHTML = "<p class='senderName'>" + comments[i].sender + "</p><p class='commentMessage'>" + comments[i].message + "</p>";
        card.querySelector(".commentField").appendChild(comment);
    }

    addListeners(card);
    document.getElementById("overlay").appendChild(card);
}

function addListeners(card) {
    // Moving card listener
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    card.onmousedown = cardMouseDown;

    function cardMouseDown(e) {
        card.classList.remove("animate");
        card.style.position = "absolute";
        card.style.zIndex = 1000;
        document.getElementById("overlay").append(card);
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragCard;
        document.onmousemove = dragCard;
    }

    function dragCard(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        card.style.top = (card.offsetTop - pos2) + "px";
        card.style.left = (card.offsetLeft - pos1) + "px";
    }

    function closeDragCard() {
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

    function sendPosChange(update) {
        socket.emit("update-pos", update);
    }

    card.ondragstart = function () {
        return false;
    };

    // Delete card listener
    card.querySelector(".deleteBtn").addEventListener("mousedown", function (event) {
        event.stopPropagation();  //prevent bubbling process so the whole card doesn't start dragging
        const cardToDelete = {_id: event.currentTarget.parentElement.id};
        socket.emit("delete-card", cardToDelete);
    });

    // Show chat
    card.querySelector(".commentBtn").addEventListener("mousedown", function (event) {
        const visibility = card.querySelector(".comments");
        if (visibility.style.display === "inline-block") {
            visibility.style.display = "none"
        } else {
            visibility.style.display = "inline-block"
        }

    });

    card.querySelector(".commentInput").addEventListener("keydown", function (e) {
        if ((e.keyCode === 10 || e.keyCode === 13)) {
            if (!e.shiftKey) {
                sendComment({
                    cardId: card.id,
                    message: $(this).val(),
                });
                card.querySelector(".commentInput").value = "";
            }
        }
    });

    // Change text of card listener
    card.querySelector("textarea").addEventListener("input", function (event) {
        socket.emit("update-text", {
            _id: event.currentTarget.parentElement.id,
            text: event.currentTarget.value
        });
    });
}

// event listeners for board
$("#board-name").on("input", function (event) {
    console.log("In Ajax ");
    socket.emit("update-board-name", {
        _id: windowBoardId,
        name: event.currentTarget.value
    });
});


$("#share-board").on("click", shareBoard);
$("#delete-board").on("click", deleteBoard);
$("#export-board").on("click", exportBoard);

function shareBoard() {
    // TODO
}

function deleteBoard() {
    socket.emit("delete-board", {_id: windowBoardId});
}

function exportBoard() {
    // TODO
}

// event listener for toolbar buttons
$("#plus").click(() => {
    socket.emit("save-card", {
        color: getRandomColor()
    });
});

//Send mere message to server, without username and time
function sendMessage(message) {
    socket.emit("message", message);
}

function sendComment(comment) {
    socket.emit("comment", comment);
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
});

socket.on("text-update", (data) => {
    const card = JSON.parse(data);
    $("#" + card._id).find("textarea").val(card.text);
});

socket.on("delete-card", (data) => {
    const card = JSON.parse(data);
    $("#" + card._id).remove(); //remove the card element by its ID
});

socket.on("board-name-update", (data) => {
    console.log("Im Update");
    const name = JSON.parse(data).name;
    $("#board-name").val(name);
    $("#board-name").css("width", name.length / 1.5 + "rem");
});

$("#user-name").on("focusout", function (event) {
    var name = event.currentTarget.value;
    $.get("/username", {username: name, credentials: "same-origin"});
});

socket.on("board-deleted", (data) => {
    alert("Board deleted");
    location.href = "/";
});

socket.on("comment", (data) => {
    const comment = document.createElement("div");
    comment.innerHTML = "<p class='senderName'>" + data.sender + "</p><p class='commentMessage'>" + data.message + "</p>";
    document.getElementById(data.cardId).querySelector(".commentField").appendChild(comment);
});

socket.on("message", message => {
    let usernameEl = $("<b>").text(message.username);
    let time = new Date(message.time);
    let timeEl = $("<span>", {class: "text-secondary float-right"}).text(time.getHours() + ":" + time.getMinutes());
    let messageHeadEl = $("<small>", {class: "messageHead"}).append(usernameEl, timeEl);
    let messageTextEl = $("<div>", {class: "messageText"}).text(message.text);
    let messageEl = $("<div>", {class: "message mt-2"}).append(messageHeadEl, messageTextEl);
    $("#chatContent").prepend(messageEl);
    chatRescaleContent();
    chatScrollBottom();
});

function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
