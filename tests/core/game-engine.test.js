import { describe, expect, it } from 'vitest';
import { createGameEngine } from '../../src/core/game-engine.js';

describe('game engine', () => {
  it('rotates turns and increments the round after the final player acts', async () => {
    const engine = createGameEngine({
      players: [
        { id: 0, name: 'A', position: 1, skipTurns: 0, turtleBuff: 0, isAI: false },
        { id: 1, name: 'B', position: 1, skipTurns: 0, turtleBuff: 0, isAI: false },
      ],
      rollDice: () => 2,
    });

    await engine.takeTurn();
    expect(engine.getState().currentPlayerIndex).toBe(1);

    await engine.takeTurn();
    expect(engine.getState().currentPlayerIndex).toBe(0);
    expect(engine.getState().turnNumber).toBe(2);
  });

  it('applies skip-turn penalties before rolling', async () => {
    const engine = createGameEngine({
      players: [{ id: 0, name: 'A', position: 10, skipTurns: 1, turtleBuff: 0, isAI: false }],
      rollDice: () => 6,
    });

    await engine.takeTurn();
    expect(engine.getState().players[0].position).toBe(10);
    expect(engine.getState().players[0].skipTurns).toBe(0);
  });

  it('does not mutate state after the game is over', async () => {
    let rollCount = 0;
    const engine = createGameEngine({
      players: [{ id: 0, name: 'A', position: 99, skipTurns: 0, turtleBuff: 0, isAI: false }],
      rollDice: () => {
        rollCount += 1;
        return 1;
      },
    });

    await engine.takeTurn();
    const stateAfterWin = engine.getState();

    await engine.takeTurn();

    expect(engine.getState()).toEqual(stateAfterWin);
    expect(rollCount).toBe(1);
  });

  it('returns a turn summary with roll result and traversed cells for board animations', async () => {
    const engine = createGameEngine({
      players: [{ id: 'crew-1', name: 'A', position: 7, skipTurns: 0, turtleBuff: 0, isAI: false }],
      rollDice: () => 4,
    });

    const nextState = await engine.takeTurn();

    expect(nextState.lastAction).toMatchObject({
      type: 'move',
      playerId: 'crew-1',
      roll: 4,
      moveBy: 4,
      from: 7,
      to: 11,
      trail: [8, 9, 10, 11],
    });
  });
});
