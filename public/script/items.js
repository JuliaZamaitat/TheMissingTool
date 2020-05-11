function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function createNewItem() {
    const div = document.createElement('div');
    div.className = 'item animate';
    div.style.backgroundColor = getRandomColor();
    div.innerHTML = "<textarea type='text' value=''></textarea>";
    div.addEventListener('mousedown', function (event) {

        const item = div;

        // Remove entrance animation
        item.classList.remove("animate");

        let shiftX = event.clientX - item.getBoundingClientRect().left;
        let shiftY = event.clientY - item.getBoundingClientRect().top;

        item.style.position = "absolute";
        item.style.zIndex = 1000;
        document.getElementById('overlay').append(item);

        moveAt(event.pageX, event.pageY);

        function moveAt(pageX, pageY) {
            item.style.left = pageX - shiftX + 'px';
            item.style.top = pageY - shiftY + 'px';
        }

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        document.addEventListener('mousemove', onMouseMove);

        item.onmouseup = function () {
            document.removeEventListener('mousemove', onMouseMove);
            item.onmouseup = null;
        };

        item.ondragstart = function () {
            return false;
        };
    });

    document.getElementById('overlay').appendChild(div);
}






