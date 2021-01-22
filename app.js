var express = require("express")
var http = require("http")
var websocket = require("ws")
var indexRouter = require("./routes/index")
var messages = require("./public/javascripts/messages")
var gameTracker = require("./gameTracker")
var Game = require("./game.js")
var port = process.argv[2]
var app = express()

app.use(express.static(__dirname + "/public"))
app.get("/play", indexRouter)
app.get("/", (req, res) => {
  res.render("splash.ejs", {
    gamesInitialized: gameTracker.gamesInitialized,
    gamesCompleted: gameTracker.gamesCompleted,
    piecesTaken: gameTracker.piecesTaken
  })
})
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')

var server = http.createServer(app)
const wss = new websocket.Server( { server })
var websockets = {}

let connectionID = 0; //each websocket gets a unique ID

let currentGame = new Game(gameTracker.gamesInitialized++)

wss.on("connection", function connection(ws) {
  let con = ws
  con.id = connectionID++
  let playerType = currentGame.addPlayer(con)
  websockets[con.id] = currentGame;

  con.send(playerType == "b" ? messages.S_PLAYER_BLACK : messages.S_PLAYER_WHITE)

  console.log(currentGame.hasTwoPlayers())
  if (!currentGame.hasTwoPlayers()) {
    let outGoingMsg = messages.O_TWO_PLAYERS_PRESENT
    outGoingMsg.data = false
    console.log(outGoingMsg)
    con.send(JSON.stringify(outGoingMsg))
  } else {
    let outGoingMsg = messages.O_TWO_PLAYERS_PRESENT
    outGoingMsg.data = true
    con.send(JSON.stringify(outGoingMsg)) //send it to player B (always 2nd to join)
    currentGame.playerA.send(JSON.stringify(outGoingMsg)) //also send it to player A (always first to join)
    currentGame = new Game(gameTracker.gamesInitialized++)
  }

  con.on("message", function incoming(message) {
    let oMsg = JSON.parse(message)

    let gameObj = websockets[con.id]

    if(oMsg.type == "MOVE") {
      if (gameObj.gameStatus != "GAMING") {
        gameObj.setState("GAMING")
      }
      if (oMsg.data.move.includes("x")) {
        gameTracker.piecesTaken++
      }
      if (oMsg.data.player == "w") {
        gameObj.playerB.send(JSON.stringify(oMsg))
      } else {
        gameObj.playerA.send(JSON.stringify(oMsg))
      }
    }

    if (oMsg.type == messages.T_DRAW_OFFER) {
      if (oMsg.sender == "w") {
        gameObj.playerB.send(JSON.stringify(oMsg))
      } else {
        gameObj.playerA.send(JSON.stringify(oMsg))
      }
    }
    if (oMsg.type == messages.T_DRAW_RESPONSE) {
      if (oMsg.data == true) {
        gameObj.setState("DONE")
        gameTracker.gamesCompleted++
      }
      if (oMsg.sender == "w") {
        gameObj.playerB.send(JSON.stringify(oMsg))
      } else {
        gameObj.playerA.send(JSON.stringify(oMsg))
      }
    }
    if (oMsg.type == messages.T_REMATCH_REQUEST) {
      if (oMsg.sender == "w") {
        gameObj.playerB.send(JSON.stringify(oMsg))
      } else {
        gameObj.playerA.send(JSON.stringify(oMsg))
      }
    }
    if (oMsg.type == messages.T_REMATCH) {
      gameObj.setState("GAMING")
      if (oMsg.sender == "w") {
        gameObj.playerB.send(JSON.stringify(oMsg))
      } else {
        gameObj.playerA.send(JSON.stringify(oMsg))
      }
      gameTracker.gamesInitialized++ //just for stat-tracking, gameObj of these sockets remains the same.
    }
    if (oMsg.type == messages.T_RESIGN) {
      gameTracker.gamesCompleted++
      if (oMsg.sender == "w") {
        gameObj.playerB.send(JSON.stringify(oMsg))
      } else {
        gameObj.playerA.send(JSON.stringify(oMsg))
      }
    }

    if(oMsg.type == messages.O_GAME_ENDED) {
      if (gameObj.gameState != "DONE") {
        gameTracker.gamesCompleted++
      }
      gameObj.setState("DONE")
    }
  }) 
  con.on("close", function(code) {
    /*
     * code 1001 means almost always closing initiated by the client;
     * source: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
     */
    console.log(con.id + " disconnected ...");

    if (code == "1001") {
      /*
       * if possible, abort the game; if not, the game is already completed
       */
      let gameObj = websockets[con.id];
      try {
        gameObj.playerA.close();
        gameObj.playerA = null;
      } catch (e) {
        console.log("Player A closing: " + e);
      }

      try {
        gameObj.playerB.close();
        gameObj.playerB = null;
      } catch (e) {
        console.log("Player B closing: " + e);
      }
    }
  })
})

server.listen(port)