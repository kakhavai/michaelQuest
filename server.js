var server = require('http').createServer(),
    url = require('url'),
    WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        server: server
    }),
    express = require('express'),
    app = express(),
    port = 4080,
    clients = [],
    count = 0;



var canvasWidth = 512;
var canvasHeight = 480;
var deleting = false;
var clientCount = 0;


var player = function() {
    this.speed = 256, // movement in pixels per second
        this.isDead = false,
        this.isMonster = false,
        this.id = -1,
        this.x = canvasWidth / 2,
        this.y = canvasHeight / 2
    this.image = 'hero';
};

var movement = function() {
    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;
}


var players = []
var playerMoves = [];
var inProgress = false;
var monsterId;


app.use(express.static(__dirname));

app.use(function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

wss.on('connection', function connection(ws) {
    var location = url.parse(ws.upgradeReq.url, true);
    // you might use location.query.access_token to authenticate or share sessions
    // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
    console.log(count + " connected");
    var uid = count++;
    clientCount++;

    clients[uid] = ws;
    if (clients.length > 1) {
        reset();
    }

    ws.on('message', function incoming(message) {
        if (message == 38) {
            if (playerMoves[uid].up)
                playerMoves[uid].up = false;
            else
                playerMoves[uid].up = true;
        } else if (message == 37) {
            if (playerMoves[uid].left)
                playerMoves[uid].left = false;
            else
                playerMoves[uid].left = true;
        } else if (message == 40) {
            if (playerMoves[uid].down)
                playerMoves[uid].down = false;
            else
                playerMoves[uid].down = true;
        } else if (message == 39) {
            if (playerMoves[uid].right)
                playerMoves[uid].right = false;
            else
                playerMoves[uid].right = true;
        } else if (message == 80) {
            sendAll('bm');
        } else if (message == 187) {
            players[uid].image = 'michael';
        }
    });


    ws.on('close', function close() {
        delete clients[uid];
        delete players[uid];
        clientCount--;

    });


});

function sendAll(message) {
    for (var i in clients) {
        if (clients[i].readyState == 1)
            clients[i].send(message);
    }
}

//16
function sendPlayerLocations() {
    if (players.length > 1) {
        sendAll(JSON.stringify(players))
    }
};



var then = Date.now();

//10
function updateLocation() {
    var now, delta;
    if (inProgress) {
        update(.02);
    }
};

var caught = 0;
// 16
function checkCaught() {
    for (var i in players) {
        if (i != monsterId) {
            if (
                players[i] != null &&
                players[monsterId] != null &&
                players[i].x <= (players[monsterId].x + 32) &&
                players[monsterId].x <= (players[i].x + 32) &&
                players[i].y <= (players[monsterId].y + 32) &&
                players[monsterId].y <= (players[i].y + 32) &&
                !players[i].isMonster
            ) {
                players[i].isDead = true;
                players[i].x = 9999;
                players[i].y = 9999;
                players[i].speed = 0;
                caught++;
            }

        }
    }
    if (caught == Object.keys(clients).length - 1 && inProgress && clientCount > 1)
        reset();
}


function main() {
    if (inProgress) {
        sendPlayerLocations();
        updateLocation();
        checkCaught();
    }
}

setInterval(main, 16);


function update(modifier) {

    var x, y, r;

    for (var i in players) {
        x = 0;
        y = 0;

        if (playerMoves[i].up) { // Player holding up
            y -= 1;
        }
        if (playerMoves[i].down) { // Player holding down
            y += 1;
        }
        if (playerMoves[i].left) { // Player holding left
            x -= 1;
        }
        if (playerMoves[i].right) { // Player holding right
            x += 1;
        }

        r = Math.sqrt(x * x + y * y);
        if (r != 0) {
            x /= r;
            y /= r;
            x *= modifier * players[i].speed;
            y *= modifier * players[i].speed;
            players[i].x += x;
            if (players[i].x > canvasWidth - 30)
                players[i].x = canvasWidth - 30;
            else if (players[i].x < 0)
                players[i].x = 0;

            players[i].y += y;
            if (players[i].y > canvasHeight - 30 && !players[i].isDead)
                players[i].y = canvasHeight - 30;
            else if (players[i].y < 0 && !players[i].isDead)
                players[i].y = 0;
        }
    }
}

var tree = function() {
    this.x = 0;
    this.y = 0;
}

function genTrees() {
    var trees = [];
    for (var i = 0; i < 30; i++) {
        trees[i] = new tree();
        trees[i].x = 32 + (Math.random() * (canvasWidth - 64));
        trees[i].y = 32 + (Math.random() * (canvasHeight - 64));
    }
    return trees;
}


function reset() {
    inProgress = false;
    for (var i in clients) {

        players[i] = new player();
        players[i].id = i;
        if (playerMoves[i] == null)
            playerMoves[i] = new movement();
    }

    //set a random player as the monster
    monsterId = Object.keys(clients)[Math.floor(Math.random() * (Object.keys(clients).length))];
    players[monsterId].isMonster = true;
    players[monsterId].x = 32 + (Math.random() * (canvasWidth - 64));
    players[monsterId].y = 32 + (Math.random() * (canvasHeight - 64));
    players[monsterId].image = 'monster';
    caught = 0;
    sendAll(JSON.stringify(genTrees()));
    sendAll(JSON.stringify(players));
    inProgress = true;
}





server.on('request', app);
server.listen(port, function() {
    console.log('Listening on ' + server.address().port)
});
