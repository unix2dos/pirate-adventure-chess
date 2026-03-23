import { applyBoardEvent, resolveBoardEvent } from './events.js';

export function createGameEngine({ players, rollDice }) {
  const state = {
    players: structuredClone(players),
    currentPlayerIndex: 0,
    turnNumber: 1,
    gameOver: false,
    pendingEvent: null,
    recentEvent: null,
    lastAction: null,
  };

  function createTrail(from, to) {
    if (!Number.isFinite(from) || !Number.isFinite(to) || from === to) {
      return [];
    }

    const direction = to > from ? 1 : -1;
    const trail = [];

    for (let step = from + direction; direction > 0 ? step <= to : step >= to; step += direction) {
      trail.push(step);
    }

    return trail;
  }

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
    if (state.gameOver || state.pendingEvent) {
      return getState();
    }

    const player = state.players[state.currentPlayerIndex];
    if (player.skipTurns > 0) {
      player.skipTurns -= 1;
      state.recentEvent = { title: `${player.name} 暂停一回合` };
      state.lastAction = {
        type: 'skip',
        playerId: player.id,
        from: player.position,
        to: player.position,
        trail: [],
      };
      advanceTurn();
      return getState();
    }

    const roll = await rollDice();
    const from = player.position;
    const moveBy = roll + (player.turtleBuff > 0 ? 1 : 0);
    const bonusStep = player.turtleBuff > 0 ? 1 : 0;
    if (player.turtleBuff > 0) {
      player.turtleBuff -= 1;
    }

    player.position = Math.min(100, player.position + moveBy);
    state.lastAction = {
      type: 'move',
      playerId: player.id,
      roll,
      bonusStep,
      moveBy,
      from,
      to: player.position,
      trail: createTrail(from, player.position),
    };
    state.recentEvent = { title: `${player.name} 前进了 ${moveBy} 格` };
    if (player.position >= 100) {
      state.gameOver = true;
      state.recentEvent = { title: '宝藏到手，冲线成功' };
      return getState();
    }

    const boardEvent = resolveBoardEvent(player.position);
    if (boardEvent?.choices?.length) {
      state.pendingEvent = {
        playerId: player.id,
        event: boardEvent,
      };
      state.lastAction = {
        ...state.lastAction,
        landedEventId: boardEvent.id,
        pendingEvent: true,
      };
      state.recentEvent = { title: boardEvent.title };
      return getState();
    }

    if (boardEvent) {
      const outcome = applyBoardEvent({
        player,
        event: boardEvent,
      });

      state.recentEvent = outcome ?? { title: boardEvent.title };
      if (player.position >= 100) {
        state.gameOver = true;
        state.recentEvent = { title: '宝藏到手，冲线成功' };
        return getState();
      }
    }

    advanceTurn();

    return getState();
  }

  function resolvePendingEvent(choiceValue) {
    if (state.gameOver || !state.pendingEvent) {
      return getState();
    }

    const pendingEvent = state.pendingEvent;
    const player = state.players.find(({ id }) => id === pendingEvent.playerId)
      ?? state.players[state.currentPlayerIndex];
    const from = player.position;
    const outcome = applyBoardEvent({
      player,
      event: pendingEvent.event,
      choiceValue,
    });

    state.pendingEvent = null;
    state.lastAction = {
      type: 'event',
      playerId: player.id,
      from,
      to: player.position,
      trail: createTrail(from, player.position),
      eventId: pendingEvent.event.id,
    };
    state.recentEvent = outcome ?? { title: '遭遇已解决' };

    if (player.position >= 100) {
      state.gameOver = true;
      state.recentEvent = { title: '宝藏到手，冲线成功' };
      return getState();
    }

    advanceTurn();
    return getState();
  }

  return { getState, takeTurn, resolvePendingEvent };
}
