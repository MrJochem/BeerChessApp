const chess = new Chess();
const board = chess.board();
const letters = ["a", "b", "c", "d", "e", "f", "g", "h"]
const squares = [[],[],[],[],[],[],[],[]]
const socket = new WebSocket("ws://localhost:3456")

function clearMoves() {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (squares[i][j].highlighted) {
        squares[i][j].element.removeChild(squares[i][j].element.querySelector(".highlighted"))
        squares[i][j].highlighted = false
      }
    }
  }
}

function ChessGame(id, player1, player2) {
  this.id = id
  this.playing = true
  this.winner = null
  this.player1 = player1
  this.player2 = player2
  this.player1Wins = 0
  this.player2Wins = 0
}

Game.prototype.checkOver = function() {
  if(chess.game_over()) {
    this.checkWinner()
    this.renderEndGameScreen()
  }
}

// should be called iff the game is over, so when this.playing == false
Game.prototype.checkWinner = function() {
  if (!chess.in_draw() && !chess.in_stalemate() && !chess.in_threefold_repetition())
  this.winner = chess.turn() == "w" ? "black" : "white" // if's white's turn to move and the game is over then white lost, if it's not white's turn, white won
  else { this.winner = "draw" }
  if (this.winner == "white") {
    this.player1Wins += 1
  }
  if (this.winner == "black") {
    this.player2Wins += 1
  }
}

Game.prototype.renderEndGameScreen = function() {
  let container = document.getElementById("game")
  let popup = document.createElement("div")
  popup.className = "postGameScreen"
  let buttonPlayAgain = document.createElement("button")
  buttonPlayAgain.className = "playAgain"
  buttonPlayAgain.innerHTML = "Play Again"
  let buttonLeave = document.createElement("button")
  buttonLeave.className = "leave"
  buttonLeave.innerHTML = "Leave"
  let text = document.createElement("span")
  text.className = "postGameText"
  text.innerHTML = this.winner == "draw" ? "It's a draw" : this.winner + " won!"
  let score = document.createElement("span")
  score.className = "score"
  score.innerHTML = this.player1 + ": " + this.player1Wins + "<br>" + this.player2 + ": " + this.player2Wins
  popup.appendChild(buttonPlayAgain)
  popup.appendChild(buttonLeave)
  popup.appendChild(text)
  popup.appendChild(score)
  container.appendChild(popup)
}

Game.prototype.renderNames = function() {
  let name1 = document.createElement("span")
  let name2 = document.createElement("span")
  name1.className = "name1" 
  name2.className = "name2"
  name1.innerHTML = this.player1
  name2.innerHTML = this.player2
  let container = document.getElementById("game")
  container.appendChild(name1)
  container.appendChild(name2)
}

class square {

  constructor(position) {
    this.position = position
    this.selected = false
    this.availableMoves = chess.moves({ square: this.position } )
    this.element = document.getElementById(this.position)
    this.occupied = chess.get(this.position) != null ? true : false
    this.piece = chess.get(this.position)
    this.highlighted = false
  }

  showMoves = () => {
    console.log("doing something..")
    this.availableMoves = chess.moves({ square: this.position })
    clearMoves()
    for (let i = 0; i < this.availableMoves.length; i++) {
      let squareToHL = this.availableMoves[i].charAt(this.availableMoves[i].length-1) != "+" && this.availableMoves[i].charAt(this.availableMoves[i].length-1) != "#" ? 
        squares[this.availableMoves[i].charAt(this.availableMoves[i].length-1)-1][letters.indexOf(this.availableMoves[i].charAt(this.availableMoves[i].length-2))]
        : squares[this.availableMoves[i].charAt(this.availableMoves[i].length-2)-1][letters.indexOf(this.availableMoves[i].charAt(this.availableMoves[i].length-3))]
      if (!squareToHL.occupied && !squareToHL.highlighted) {
        if (squareToHL.element.className == "light") {
          let img = document.createElement("img")
          img.src = "images/darkCircle.png"
          img.className = "highlighted"
          img.style.height = "50%"
          img.style.width = "50%"
          img.addEventListener('click', () => this.move(this.availableMoves[i]))
          squareToHL.element.appendChild(img)
        } else {
          let img = document.createElement("img")
          img.src = "images/darkCircle.png"
          img.className = "highlighted"
          img.style.height = "50%"
          img.style.width = "50%"
          img.addEventListener('click', () => this.move(this.availableMoves[i]))
          squareToHL.element.appendChild(img)
        }
      } else if (!squareToHL.highlighted) {
        let img = document.createElement("img")
        img.src = "images/captureCircle.png"
        img.className = "highlighted"
        img.style.display = "blocked"
        img.style.height = "165%"
        img.style.width = "165%"
        img.style.margin = "-82.5% 0 0 -82.5%"
        img.addEventListener('click', () => this.move(this.availableMoves[i]))
        squareToHL.element.appendChild(img)
      }
      squareToHL.highlighted = true
    }
  }


  move = (move) => {
    if (chess.move(move) != null) {
      this.occupied = false
      let piece = this.element.querySelector(".piece")
      let targetSquare = move.charAt(move.length-1) != "+" && move.charAt(move.length-1) != "#"  ?
        squares[move.charAt(move.length-1)-1][letters.indexOf(move.charAt(move.length-2))]
        : squares[move.charAt(move.length-2)-1][letters.indexOf(move.charAt(move.length-3))]
      targetSquare.element.appendChild(piece)
      targetSquare.occupied = true
      if (move.includes("x")) {
        targetSquare.element.removeChild(targetSquare.element.querySelector(".piece"))
      }
      instantiateSquares()
      movesSideBar()
      game.checkOver()
    }
  }
}

function movesSideBar() {
    let span = document.getElementById("moves")
    console.log("span" + span)
    span.innerHTML = "moves: <br>" + chess.history().toString()
}

for (let i = 0; i < 8; i++) {
  for (let j = 1; j <= 8; j++) {
    squares[j-1].push(new square(letters[i]+j))
  }
}

let game = new Game(0, "Lesley", "Jochem") //hardcoded for now going to get passed on from splash screen (where user enters name to play.)

function instantiateSquares() {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      squares[i][j].element.addEventListener("click", () => squares[i][j].showMoves())
    }
  }
}

instantiateSquares()
game.renderNames()

console.log(squares)