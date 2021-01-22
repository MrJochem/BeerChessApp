(function(exports) {
  /*
   * Client to server: game is complete, the winner is ...
   */
  exports.T_GAME_ENDED = "GAME-ENDED"
  exports.O_GAME_ENDED = {
    type: exports.T_GAME_ENDED,
    data: null
  }

  /*
   * Server to client: abort game (e.g. if second player exited the game)
   */
  exports.O_GAME_ABORTED = {
    type: "GAME-ABORTED"
  }
  exports.S_GAME_ABORTED = JSON.stringify(exports.O_GAME_ABORTED)

  /*
    client to server or server to client: MOVE was made.
  */
  exports.O_MOVE = {
    type: "MOVE",
    data: null
  }

  /*
   * Server to client: set as player A
   */
  exports.T_PLAYER_TYPE = "PLAYER-TYPE"
  exports.O_PLAYER_WHITE = {
    type: exports.T_PLAYER_TYPE,
    data: "w"
  }
  exports.S_PLAYER_WHITE = JSON.stringify(exports.O_PLAYER_WHITE)

  /*
   * Server to client: set as player B
   */
  exports.O_PLAYER_BLACK = {
    type: exports.T_PLAYER_TYPE,
    data: "b"
  }
  exports.S_PLAYER_BLACK = JSON.stringify(exports.O_PLAYER_BLACK)


  exports.T_REMATCH_REQUEST = "REMATCH-REQUEST"
  exports.O_REMATCH_REQUEST = {
    type: exports.T_REMATCH_REQUEST,
    sender: null
  }

  exports.T_DRAW_OFFER = "OFFER-DRAW"
  exports.O_DRAW_OFFER = {
    type: exports.T_DRAW_OFFER,
    sender: null
  }

  exports.T_DRAW_RESPONSE = "DRAW-RESPONSE"
  exports.O_DRAW_RESPONSE = {
    type: exports.T_DRAW_RESPONSE,
    data: null,
    sender: null
  }

  exports.T_REMATCH = "REMATCH"
  exports.O_REMATCH = {
    type: exports.T_REMATCH
  }

  exports.T_RESIGN = "RESIGN" 
  exports.O_RESIGN = {
    type: exports.T_RESIGN
  }

  exports.T_TWO_PLAYERS_PRESENT = "TWO-PLAYERS-PRESENT"
  exports.O_TWO_PLAYERS_PRESENT = {
    type: exports.T_TWO_PLAYERS_PRESENT,
    data: null
  }

})(typeof exports === "undefined" ? (this.Messages = {}) : exports)
//if exports is undefined, we are on the client else the server