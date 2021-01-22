let Game = function(gameID) {
  this.playerA = null
  this.playerB = null
  this.id = gameID
  this.gameState = "0 JOINT"
}

Game.prototype.states = []
Game.prototype.states.push("0 JOINT")
Game.prototype.states.push("1 JOINT")
Game.prototype.states.push("2 JOINT")
Game.prototype.states.push("GAMING") 
Game.prototype.states.push("DONE") 
Game.prototype.states.push("ABORTED")

Game.prototype.hasTwoPlayers = function () {
  return this.gameState == "2 JOINT" || this.gameState == "GAMING" || this.gameState == "DONE"
}

Game.prototype.isValidState = function(w) {
  return this.states.includes(w)
}

Game.prototype.setState = function(w) {
  if (this.isValidState(w)) {
    this.gameState = w;
  }
}

Game.prototype.hasOpenSpot = function () {
  return this.gameState == "0 JOINT" || this.gameState == "1 JOINT"
}

Game.prototype.addPlayer = function (p) {
  if (!this.hasOpenSpot()) {
    return "error"
  }
  if (this.playerA == null) {
    this.playerA = p
    this.setState("1 JOINT")
    return "w"
  } else {
    this.playerB = p
    this.setState("2 JOINT")
    return "b"
  }
}

module.exports = Game