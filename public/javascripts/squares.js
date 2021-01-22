class square {

  constructor(position, chess) {
    this.chess = chess;
    this.position = position
    this.selected = false
    this.availableMoves = this.chess.moves({ square: this.position } )
    this.element = document.getElementById(this.position)
    this.letters = ["a", "b", "c", "d", "e", "f", "g", "h"]
    this.occupied = this.chess.get(this.position) != null ? true : false
    this.highlighted = false
  }

  showMoves = (color, squares) => {
    if (this.chess.turn() == color) {
      this.availableMoves = this.chess.moves({ square: this.position }) //make sure availablemoves is up to date with the current board
      for (let i = 0; i < this.availableMoves.length; i++) {
        let squareToHL = this.availableMoves[i].charAt(this.availableMoves[i].length-1) != "+" && this.availableMoves[i].charAt(this.availableMoves[i].length-1) != "#" ? 
          squares[this.availableMoves[i].charAt(this.availableMoves[i].length-1)-1][this.letters.indexOf(this.availableMoves[i].charAt(this.availableMoves[i].length-2))]
          : squares[this.availableMoves[i].charAt(this.availableMoves[i].length-2)-1][this.letters.indexOf(this.availableMoves[i].charAt(this.availableMoves[i].length-3))]
        if (!squareToHL.occupied && !squareToHL.highlighted) {
          if (squareToHL.element.className == "light") {
            let img = document.createElement("img")
            img.id = this.availableMoves[i]
            img.src = "images/darkCircle.png"
            img.className = "highlighted"
            img.style.height = "50%"
            img.style.width = "50%"
            // img.addEventListener('click', () => this.move(this.availableMoves[i]))
            squareToHL.element.appendChild(img)
          } else {
            let img = document.createElement("img")
            img.id = this.availableMoves[i]
            img.src = "images/darkCircle.png"
            img.className = "highlighted"
            img.style.height = "50%"
            img.style.width = "50%"
            // img.addEventListener('click', () => this.move(this.availableMoves[i]))
            squareToHL.element.appendChild(img)
          }
        } else if (!squareToHL.highlighted) {
          let img = document.createElement("img")
          img.id = this.availableMoves[i]
          img.src = "images/captureCircle.png"
          img.className = "highlighted"
          img.style.display = "blocked"
          img.style.height = "165%"
          img.style.width = "165%"
          img.style.margin = "-82.5% 0 0 -82.5%"
          // img.addEventListener('click', () => this.move(this.availableMoves[i]))
          squareToHL.element.appendChild(img)
        }
        squareToHL.highlighted = true
      }
    }
  }
}
