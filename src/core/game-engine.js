export function createGameEngine({ players, rollDice }) {
  const state = {
    players: structuredClone(players),
    currentPlayerIndex: 0,
    turnNumber: 1,
    gameOver: false,
  };

  function getState() {
    return structuredClone(state);
  }

  function advanceTurn() {
    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
    if (state.currentPlayerIndex === 0) {
      state.turnNumber += 1;
    }
  }

  async function takeTurn() {
    const player = state.players[state.currentPlayerIndex];
    if (player.skipTurns > 0) {
      player.skipTurns -= 1;
      advanceTurn();
      return getState();
    }

    const roll = await rollDice();
    const moveBy = roll + (player.turtleBuff > 0 ? 1 : 0);
    if (player.turtleBuff > 0) {
      player.turtleBuff -= 1;
    }

    player.position = Math.min(100, player.position + moveBy);
    if (player.position >= 100) {
      state.gameOver = true;
    }

    if (!state.gameOver) {
      advanceTurn();
    }

    return getState();
  }

  return { getState, takeTurn };
}
