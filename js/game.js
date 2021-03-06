// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

var bgImage = new Image();

bgImage.src = "images/background.png";
bgImage.onload = function() {
    ctx.drawImage(bgImage, 0, 0);
}

var heroImage = new Image();
heroImage.src = "images/hero.png";

// Monster image
var monsterImage = new Image();
monsterImage.src = "images/monster.png";

var michaelImage = new Image();
michaelImage.src = "images/michael.png";

var treeImage = new Image();
treeImage.src = "images/tree.png"


var images = [];
images['monster'] = monsterImage;
images['hero'] = heroImage;
images['michael'] = michaelImage;
images['tree'] = treeImage;


var monster = {};
var monstersCaught = 0;

// Handle keyboard controls
var keysDown = {};
var gameStarted = false;
var trees = [];


// Score
ctx.drawImage(bgImage, 0, 0);
ctx.fillStyle = "rgb(250, 250, 250)";
ctx.font = "20px Helvetica";
ctx.textAlign = "left";
ctx.textBaseline = "top";
ctx.drawImage(bgImage, 0, 0);
ctx.fillText("Time Alive: ", 0, 0);

var count = 0;

function timer() {
    count += .01;
}


addEventListener("keydown", function(e) {
    if (!keysDown[e.keyCode]) {
        ws.send(e.keyCode);
        keysDown[e.keyCode] = true;
    }
}, false);

addEventListener("keyup", function(e) {
    delete keysDown[e.keyCode];
    ws.send(e.keyCode);
}, false);

// Cross-browser support for requestAnimationFrame
var w = window;
var toClear;
var best = 0;

requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;


if ("WebSocket" in window) {
    // Let us open a web socket
    ws = new WebSocket("ws://192.168.0.104:4080//");
    ws.onopen = function() {
        // Web Socket is connected, send data using send()
        //ws.send("Client ping");
        ctx.drawImage(bgImage, 0, 0);
        ctx.fillText("Time Alive: " + count, 32, 32);
        ctx.drawImage(bgImage, 0, 0);
    };

    ws.onmessage = function(evt) {
        ctx.drawImage(bgImage, 0, 0);
        var test;
        if (evt.data == 'bm') {
            var msg = new SpeechSynthesisUtterance('ALLAH ACK BAR!');
            msg.voice = speechSynthesis.getVoices().filter(function(voice) {
                return voice.name == 'Deranged';
            })[0];
            speechSynthesis.speak(msg);
        } else if ((test = JSON.parse(evt.data))[0] != null && !("image" in test[0])) {
            trees = JSON.parse(evt.data);
            clearInterval(toClear);
            if (count > best)
                best = count.toFixed(2);
            count = 0;
            toClear = setInterval(timer, 10);

        } else {
            var players = test;
            for (var i in players) {
                if (players[i] != null)
                    ctx.drawImage(images[players[i].image], players[i].x, players[i].y);
            }
        }
        for (var i in trees)
            ctx.drawImage(treeImage, trees[i].x, trees[i].y);

        ctx.fillText("Time Alive: " + count.toFixed(2), 0, 0);
        ctx.fillText("Session Best:  " + best, 300, 0);

    };

    ws.onclose = function() {
        //alert("Connection is closed...");
    };

}


ctx.drawImage(bgImage, 0, 0);
