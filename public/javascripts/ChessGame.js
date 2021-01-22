const chess = new Chess()

let winAudio = new Audio('/sounds/win.wav')
winAudio.volume = 0.1
let loseAudio = new Audio('/sounds/lose.wav')
loseAudio.volume = 0.1
let moveAudio = new Audio('/sounds/move.wav')
let startAudio = new Audio('/sounds/start.wav')

function ChessGame(socket) { 
  this.squares = [[],[],[],[],[],[],[],[]]
  this.letters = ["a", "b", "c", "d", "e", "f", "g", "h"]
  for (let i = 0; i < 8; i++) {
    for (let j = 1; j <= 8; j++) {
      this.squares[j-1].push(new square(this.letters[i]+j, chess))
    }
  }
  this.playerType = null //either b or w
  this.player1 = null //this player's username
  this.player2 = null //opponent's username
  this.winner = null //either black, white or draw
  this.player1Wins = 0 //to track for post-game screen
  this.player2Wins = 0 //to track for post-game screen 
  this.socket = socket
  this.startingBoardCopy = document.getElementById("game").cloneNode(true)
  this.waiting = false;
}

ChessGame.prototype.clearMoves = function() {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (this.squares[i][j].highlighted) {
        this.squares[i][j].element.removeChild(this.squares[i][j].element.querySelector(".highlighted"))
        this.squares[i][j].highlighted = false
      }
    }
  }
}

ChessGame.prototype.initializeSquares = function() {
  this.squares = [[],[],[],[],[],[],[],[]]
  for (let i = 0; i < 8; i++) {
    for (let j = 1; j <= 8; j++) {
      this.squares[j-1].push(new square(this.letters[i]+j, chess))
    }
  }
}

ChessGame.prototype.instantiateSquares = function() {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      this.squares[i][j].element.addEventListener("click", () => {
        this.clearMoves()
        this.squares[i][j].showMoves(this.playerType, this.squares)
        let moves = document.querySelectorAll(".highlighted")
        Array.from(moves).forEach(function (el) {
          el.addEventListener("click", () => {
            console.log(this)
            this.move(this.squares[i][j], el.id)
            this.checkOver()
          })
        }.bind(this))
      })
    }
  }
}

//removing the listeners by cloning
ChessGame.prototype.stopMoves = function() {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const old_element = this.squares[i][j].element
      const new_element = old_element.cloneNode(true)
      old_element.parentNode.replaceChild(new_element, old_element)
    }
  }
}

ChessGame.prototype.move = function(from, move) {
  console.log(from)
  if (chess.move(move) != null) {
    from.occupied = false
    let piece = from.element.querySelector(".piece")
    let targetSquare = move.charAt(move.length-1) != "+" && move.charAt(move.length-1) != "#"  ?
      this.squares[move.charAt(move.length-1)-1][this.letters.indexOf(move.charAt(move.length-2))]
      : this.squares[move.charAt(move.length-2)-1][this.letters.indexOf(move.charAt(move.length-3))]
    targetSquare.element.appendChild(piece)
    targetSquare.occupied = true
    if (move.includes("x")) {
      targetSquare.element.removeChild(targetSquare.element.querySelector(".piece"))
    }
    moveAudio.play()
  }
  let message = Messages.O_MOVE
  message.data = {
    from: from.position,
    move: move,
    player: this.playerType
  }
  this.socket.send(JSON.stringify(message))
  this.updateMoves()
}

ChessGame.prototype.moveOpponent = function(from, move) {
  console.log(from)
  if (chess.move(move) != null) {
    from.occupied = false
    let piece = from.element.querySelector(".piece")
    let targetSquare = move.charAt(move.length-1) != "+" && move.charAt(move.length-1) != "#"  ?
      this.squares[move.charAt(move.length-1)-1][this.letters.indexOf(move.charAt(move.length-2))]
      : this.squares[move.charAt(move.length-2)-1][this.letters.indexOf(move.charAt(move.length-3))]
    targetSquare.element.appendChild(piece)
    targetSquare.occupied = true
    if (move.includes("x")) {
      targetSquare.element.removeChild(targetSquare.element.querySelector(".piece"))
    }
  }
  this.updateMoves()
}

ChessGame.prototype.updateMoves = function() {
  let movesContainer = document.getElementById("moves")
  movesContainer.innerHTML = chess.history();
}

ChessGame.prototype.checkOver = function() {
  if(chess.game_over()) {
    this.checkWinner()
    let message = Messages.O_GAME_ENDED
    message.data = this.winner;
    this.socket.send(JSON.stringify(message))
    this.renderEndGameScreen()
  }
}

// should be called iff the ChessGame is over
ChessGame.prototype.checkWinner = function() {
  if (!chess.in_draw() && !chess.in_stalemate() && !chess.in_threefold_repetition())
  this.winner = chess.turn() == "w" ? "black" : "white" // if's white's turn to move and the ChessGame is over then white lost, if it's not white's turn, white won
  else { this.winner = "draw" }
  if (this.winner == "white" && this.playerType == "w") {
    this.player1Wins++
  }
  else if (this.winner == "black" && this.playerType == "b") {
    this.player1Wins++
  } else if (this.winner != "draw") {
    this.player2Wins++
  }
}

ChessGame.prototype.renderEndGameScreen = function() {
  this.stopMoves()
  let resignButton = document.getElementById("resign")
  let drawButton = document.getElementById("draw")
  resignButton.disabled = true
  drawButton.disabled = true
  let container = document.getElementById("game")
  let popup = document.createElement("div")
  popup.className = "popup"
  let buttonPlayAgain = document.createElement("button")
  buttonPlayAgain.className = "playAgain"
  buttonPlayAgain.innerHTML = "Play Again"
  let buttonLeave = document.createElement("button")
  buttonLeave.className = "leave"
  buttonLeave.innerHTML = "Leave"
  console.log(this.winner, this.playerType)
  if((this.winner == "white" && this.PlayerType == "w") || (this.winner == "black" && this.playerType == "b")){
    winAudio.play()
  }
  else if(this.winner != "draw"){
     loseAudio.play()
   }
  buttonLeave.onclick = () => {
    window.location.href = "/"
  }
  
  let text = document.createElement("span")
  text.className = "popupText"
  text.innerHTML = this.winner == "draw" ? "draw" : this.winner + " won!"
  let score = document.createElement("span")
  score.className = "score"
  score.innerHTML =  "You: " + this.player1Wins + "<br>" + "Opponent: " + this.player2Wins
  popup.appendChild(buttonPlayAgain)
  popup.appendChild(buttonLeave)
  popup.appendChild(text)
  popup.appendChild(score)
  container.appendChild(popup)
  buttonPlayAgain.onclick = () => {
    text.innerHTML = "waiting on response.."
    popup.removeChild(buttonPlayAgain)
    let message = Messages.O_REMATCH_REQUEST
    message.sender = this.playerType
    this.socket.send(JSON.stringify(message))
  }
}

ChessGame.prototype.gameAborted = function() {
  this.player1Wins++
  let container = document.getElementById("game")
  let popup = document.createElement("div")
  popup.className = "popup"
  let buttonLeave = document.createElement("button")
  buttonLeave.style.left = "50%"
  buttonLeave.className = "leave"
  buttonLeave.innerHTML = "Leave"
  buttonLeave.onclick = () => {
    window.location.href = "/"
  }
  let text = document.createElement("span")
  text.className = "popupText"
  text.innerHTML = "Your opponent aborted the game"
  let score = document.createElement("span")
  score.className = "score"
  score.innerHTML = "you" + ": " + this.player1Wins + "<br>" + "opponent" + ": " + this.player2Wins
  popup.appendChild(text)
  popup.appendChild(score)
  popup.appendChild(buttonLeave)
  container.appendChild(popup)
}

ChessGame.prototype.playAgainReq = function() {
  let container = document.getElementById("game")
  let popup = document.createElement("div")
  popup.className = "popup"
  let buttonAccept = document.createElement("button")
  let buttonDecline = document.createElement("button")
  buttonAccept.className = "playAgain"
  buttonDecline.className = "leave"
  buttonAccept.innerHTML = "Accept"
  buttonDecline.innerHTML = "Decline"
  buttonDecline.onclick = () => {
    window.location.href = "/"
  }
  buttonAccept.onclick = () => {
    let message = Messages.O_REMATCH
    message.sender = this.playerType
    this.socket.send(JSON.stringify(message))
    this.rematch()
  }
  let text = document.createElement("span")
  text.className = "popupText"
  text.innerHTML = "Your opponent wants a rematch"
  popup.appendChild(buttonAccept)
  popup.appendChild(buttonDecline)
  popup.appendChild(text)
  container.appendChild(popup)
}

ChessGame.prototype.opponentLeft = function() {
  let container = document.getElementById("game")
  let popup = document.createElement("div")
  popup.className = "popup"
  let buttonLeave = document.createElement("button")
  buttonLeave.style.left = "50%"
  buttonLeave.className = "leave"
  buttonLeave.innerHTML = "Leave"
  buttonLeave.onclick = () => {
    window.location.href = "/"
  }
  let text = document.createElement("span")
  text.className = "popupText"
  text.innerHTML = "Your opponent has left"
  let score = document.createElement("span")
  score.className = "score"
  score.innerHTML = "you" + ": " + this.player1Wins + "<br>" + "opponent" + ": " + this.player2Wins
  popup.appendChild(buttonLeave)
  popup.appendChild(text)
  popup.appendChild(score)
  container.appendChild(popup)
}

ChessGame.prototype.resign = function() {
  this.winner = this.playerType == "w" ? "black" : "white"
  this.player2Wins++
  let message = Messages.O_RESIGN
  message.sender = this.playerType
  this.socket.send(JSON.stringify(message))
  this.renderEndGameScreen()
}

ChessGame.prototype.opponentResign = function() {
  this.winner = this.playerType == "w" ? "white" : "black"
  this.player1Wins++
  this.renderEndGameScreen()
}

ChessGame.prototype.offerDraw = function() {
  let container = document.getElementById("game")
  let popup = document.createElement("div")
  popup.className = "popup"
  let text = document.createElement("span")
  text.className = "popupText"
  text.innerHTML = "Offered a draw to your opponent"
  popup.appendChild(text)
  container.appendChild(popup)
  let message = Messages.O_DRAW_OFFER
  message.sender = this.playerType
  this.socket.send(JSON.stringify(message))
  setTimeout(function() {
    container.removeChild(popup)
  }, 2500)
}

ChessGame.prototype.drawOffer = function() {
  let container = document.getElementById("game")
  let popup = document.createElement("div")
  popup.className = "popup"
  let buttonAccept = document.createElement("button")
  let buttonDecline = document.createElement("button")
  buttonAccept.onclick = () => {
    let message = Messages.O_DRAW_RESPONSE
    message.data = true
    message.sender = this.playerType
    this.socket.send(JSON.stringify(message))
    this.winner = "draw"
    this.renderEndGameScreen()
  }
  buttonAccept.className = "playAgain"
  buttonDecline.className = "leave"
  buttonAccept.innerHTML = "Accept"
  buttonDecline.innerHTML = "Decline"
  let text = document.createElement("span")
  text.className = "popupText"
  text.innerHTML = "Your opponent offers a draw"
  popup.appendChild(buttonAccept)
  popup.appendChild(buttonDecline)
  popup.appendChild(text)
  container.appendChild(popup)
  buttonDecline.onclick = () => {
    let message = Messages.O_DRAW_RESPONSE
    message.data = false
    message.sender = this.playerType
    this.socket.send(JSON.stringify(message))
    container.removeChild(popup) 
  }
}

ChessGame.prototype.drawDecline = function() {
  let container = document.getElementById("game")
  let popup = document.createElement("div")
  popup.className = "popup"
  let text = document.createElement("span")
  text.className = "popupText"
  text.innerHTML = "Your opponent declined"
  popup.appendChild(text)
  container.appendChild(popup)
  setTimeout(function() {
    container.removeChild(popup)
  }, 2500)
}

ChessGame.prototype.wait = function() {
  this.waiting = true
  let container = document.getElementById("game")
  let popup = document.createElement("div")
  popup.id = "waiting"
  popup.className = "popup"
  let buttonLeave = document.createElement("button")
  buttonLeave.style.left = "50%"
  buttonLeave.className = "leave"
  buttonLeave.innerHTML = "Cancel"
  buttonLeave.onclick = () => {
    window.location.href = "/"
  }
  let text = document.createElement("span")
  text.className = "popupText"
  text.innerHTML = "Waiting for an opponent to join.."
  popup.appendChild(text)
  popup.appendChild(buttonLeave)
  container.appendChild(popup)
}

ChessGame.prototype.removeWaiting = function() {
  if (this.waiting) {
    document.getElementById("game").removeChild(document.getElementById("waiting"))
  }
}

ChessGame.prototype.renderNames = function() {
  let name1 = document.createElement("span")
  let name2 = document.createElement("span")
  name1.className = "name1" 
  name2.className = "name2"
  if (this.playerType == "w") {
    name1.innerHTML = "you"
    name2.innerHTML = "opponent"
  } else {
    name1.innerHTML = "opponent"
    name2.innerHTML = "you"
  }
  let container = document.getElementById("game")
  container.appendChild(name1)
  container.appendChild(name2)
}

ChessGame.prototype.rematch = function() {
  chess.reset()
  this.winner = null;
  console.log(this.startingBoardCopy)
  document.getElementById("game").replaceWith(this.startingBoardCopy) //overwrites the entire game (including any popups etc.)
  this.startingBoardCopy = document.getElementById("game").cloneNode(true)
  this.initializeSquares()
  this.instantiateSquares()
  let resignButton = document.getElementById("resign")
  let drawButton = document.getElementById("draw")
  resignButton.disabled = false
  drawButton.disabled = false
  this.renderNames() //readd the names
}

let setup = function() {
  let socket = new WebSocket(Setup.WEB_SOCKET_URL)

  let chessGame = new ChessGame(socket)

  socket.onmessage = function(event) {
    let incomingMsg = JSON.parse(event.data)
    console.log(incomingMsg)
    
    if (incomingMsg.type == Messages.T_PLAYER_TYPE) {
      chessGame.playerType = incomingMsg.data
    }

    if (incomingMsg.type == Messages.T_TWO_PLAYERS_PRESENT) {
      if (incomingMsg.data == true) {
        startAudio.play()
        chessGame.removeWaiting()
        chessGame.instantiateSquares()
        let resignButton = document.getElementById("resign")
        resignButton.onclick = () => chessGame.resign()
        resignButton.style.display = "block"
        let drawButton = document.getElementById("draw")
        drawButton.onclick = () => chessGame.offerDraw()
        drawButton.style.display = "block"
        chessGame.renderNames()
      } else {
        chessGame.wait()
      }
    }

    if (incomingMsg.type == "MOVE") {
      console.log(incomingMsg.data.from)
      chessGame.moveOpponent(chessGame.squares[incomingMsg.data.from.charAt(1)-1][chessGame.letters.indexOf(incomingMsg.data.from.charAt(0))], incomingMsg.data.move)
      chessGame.checkOver() //check if the game is over after the move.
    }

    if (incomingMsg.type == Messages.T_REMATCH_REQUEST) {
      chessGame.playAgainReq()
    }

    if (incomingMsg.type == Messages.T_REMATCH) {
      chessGame.rematch()
    }

    if (incomingMsg.type == Messages.T_DRAW_OFFER) {
      chessGame.drawOffer()
    }

    if (incomingMsg.type == Messages.T_DRAW_RESPONSE) {
      if (incomingMsg.data == true) {
        chessGame.winner = "draw"
        chessGame.renderEndGameScreen()
      }
      if (incomingMsg.data == false) {
        chessGame.drawDecline()
      }
    }

    if (incomingMsg.type == Messages.T_RESIGN) {
      chessGame.opponentResign()
    }

    if (incomingMsg.type == "GAME-ABORTED") {
      chessGame.winner = chessGame.playerType == "w" ? "white" : "black"
      chessGame.gameAborted()
    }
  }
  socket.onopen = function() {
    console.log("opening")
    socket.send("{}")
  }

  socket.onclose = function() {
    console.log("closing")
    if (chessGame.winner == null) {
      chessGame.gameAborted()
    } else {
      chessGame.opponentLeft()
    }
  }
  
}
setup()