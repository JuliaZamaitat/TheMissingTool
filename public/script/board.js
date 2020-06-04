var zoom = "100";
var position = $("#zoom-container").scrollTop();

window.onload = function () {
    $("#create-board").on("click", createBoard);
    $("#share-board").on("click", copyToClipboard);
    zoomOnClick();
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
    const temp = document.createElement('input'), text = window.location.href;
    document.body.appendChild(temp);
    temp.value = text;
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);

    $(".notifier").toggleClass("active");
    setTimeout(function () {
        $(".notifier").removeClass("active");
    }, 1000);
}

// TODO: zoom on scroll, navigation panel (mini map) for board
// function zoomOnScroll() {
//     $("#zoom-container").on("scroll", function() {
//         var scroll = $("#zoom-container").scrollTop();

//         if (scroll > position) { //scroll down
//             zoom--;
//             $("#overlay").css('zoom', zoom + "%");
//         } else {
//             zoom++;
//             $("#overlay").css('zoom', zoom + "%");
//         }
//         position = scroll;
//     });
// }

function zoomOnClick() {
    var interval = 0;
    $("#zoom-in").mousedown(function() {
        interval = setInterval(function() {
            zoom++;
            $("#overlay").css("zoom", zoom + "%");
        }, 50);
    }).mouseup(function() {
        clearInterval(interval);
    });

    $("#zoom-out").mousedown(function() {
        interval = setInterval(function() {
            zoom--;
            $("#overlay").css("zoom", zoom + "%");
        }, 50);
    }).mouseup(function() {
        clearInterval(interval);
    });
}