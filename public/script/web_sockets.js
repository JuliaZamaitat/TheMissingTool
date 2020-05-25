let socketId;
let url = window.location.href;
let windowBoardId = url.substr(url.lastIndexOf("/") + 1);
const socket = io();

window.onload = function () {
    socket.on('connect', function () {
        socketId = socket.io.engine.id;
    });
    $.get('/board/' + windowBoardId, (cards) => {
        cards.forEach(createCard);
    })
};

function createCard(data) {
    const card = document.createElement('div');
    card.className = 'item animate';
    card.innerHTML = "<span type='button' class='deleteBtn rounded'><i class='fa fa-trash-o'></i></span><textarea type='text' value=''></textarea>";
    card.id = data._id;
    card.style.left = data.position.left + 'px';
    card.style.top = data.position.top + 'px';
    card.style.fontSize = data.fontSize;
    card.style.backgroundColor = data.backgroundColor;
    if (data.text != null) {
        card.querySelector("textarea").value = data.text; //Show the card text if defined
    }
    addListeners(card);
    document.getElementById('overlay').appendChild(card)
}

function addListeners(card) {

    // Moving card listener
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    card.onmousedown = cardMouseDown;

    function cardMouseDown(e) {
        card.classList.remove("animate");
        card.style.position = "absolute";
        card.style.zIndex = 1000;
        document.getElementById('overlay').append(card);
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
                left: card.style.left.replace(/\D/g, ''),
                top: card.style.top.replace(/\D/g, ''),
            },
            boardId: windowBoardId
        });
        document.onmouseup = null;
        document.onmousemove = null;

    }

    function sendPosChange(update) {
        $.post('/update-pos', update)
    }

    card.ondragstart = function () {
        return false;
    };

    // Delete card listener
    card.querySelector('.deleteBtn').addEventListener('mousedown', function (event) {
        event.stopPropagation();  //prevent bubbling process so the whole card doesn't start dragging
        const cardToDelete = {_id: event.currentTarget.parentElement.id, boardId: windowBoardId};
        $.post('/delete-card', cardToDelete) //send card ID over for deletion
    });

    // Change text of card listener
    card.querySelector('textarea').addEventListener('input', function (event) {
        sendTextChange({
            _id: event.currentTarget.parentElement.id,
            text: event.currentTarget.value,
            boardId: windowBoardId
        })
    });

    function sendTextChange(update) {
        $.post('/update-text', update);
    }
}

// event listener for plus button
$("#plus").click(() => {
    newCard({
        color: getRandomColor(),
        boardId: windowBoardId
    });
});

function newCard(card) {
    $.post('/', card)
}

// listening to web-sockets
socket.on('new-card', parseAndCreate);

function parseAndCreate(data) {
    const card = JSON.parse(data);
    if (isRightBoard(card)) {
        createCard(card)
    }
}

socket.on('pos-update', changePosition);

function changePosition(data) {
    const card = JSON.parse(data);
    if (isRightBoard(card)) {
        let cardById = document.getElementById(card._id);
        cardById.style.left = card.position.left + 'px';
        cardById.style.top = card.position.top + 'px';
    }
}

socket.on('text-update', updateText);

function updateText(data) {
    const card = JSON.parse(data);
    if (isRightBoard(card)) {
        $('#' + card._id).find('textarea').val(card.text);
    }
}

socket.on('delete-card', deleteCard);

function deleteCard(data) {
    const card = JSON.parse(data);
    if (isRightBoard(card)) {
        $('#' + card._id).remove(); //remove the card element by its ID
    }
}

// utils functions
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function isRightBoard(card) {
    let boardId = card.boardId;
    if (Array.isArray(boardId)) {
        return boardId[0].toString() === windowBoardId;
    } else {
        return boardId.toString() === windowBoardId;
    }
}

