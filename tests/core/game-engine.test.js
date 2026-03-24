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

  it('tracks the two most recent dice rolls for HUD summaries', async () => {
    const rolls = [2, 5, 3];
    const engine = createGameEngine({
      players: [
        { id: 'crew-1', name: '小船长', position: 1, skipTurns: 0, turtleBuff: 0, isAI: false },
        { id: 'crew-2', name: '海盗甲', position: 1, skipTurns: 0, turtleBuff: 0, isAI: false },
      ],
      rollDice: () => rolls.shift(),
    });

    await engine.takeTurn();
    expect(engine.getState().recentRolls).toEqual([
      { playerId: 'crew-1', playerName: '小船长', roll: 2, turnNumber: 1 },
    ]);

    await engine.takeTurn();
    expect(engine.getState().recentRolls).toEqual([
      { playerId: 'crew-2', playerName: '海盗甲', roll: 5, turnNumber: 1 },
      { playerId: 'crew-1', playerName: '小船长', roll: 2, turnNumber: 1 },
    ]);

    await engine.takeTurn();
    expect(engine.getState().recentRolls).toEqual([
      { playerId: 'crew-1', playerName: '小船长', roll: 3, turnNumber: 2 },
      { playerId: 'crew-2', playerName: '海盗甲', roll: 5, turnNumber: 1 },
    ]);
  });

  it('triggers the wish star event on cell 14 and resolves the chosen movement', async () => {
    const engine = createGameEngine({
      players: [{ id: 'crew-1', name: 'A', position: 13, skipTurns: 0, turtleBuff: 0, isAI: false }],
      rollDice: () => 1,
    });

    const eventState = await engine.takeTurn();

    expect(eventState.pendingEvent?.event.title).toBe('许愿星');
    expect(eventState.lastAction).toMatchObject({
      type: 'move',
      from: 13,
      to: 14,
      pendingEvent: true,
    });

    const resolvedState = engine.resolvePendingEvent({ type: 'move', steps: 2 });

    expect(resolvedState.players[0].position).toBe(16);
    expect(resolvedState.pendingEvent).toBeNull();
  });

  it('keeps the same player active after landing on the bonus-roll sticker cell', async () => {
    const rolls = [1, 2];
    const engine = createGameEngine({
      players: [
        { id: 'crew-1', name: 'A', position: 26, skipTurns: 0, turtleBuff: 0, isAI: false },
        { id: 'crew-2', name: 'B', position: 1, skipTurns: 0, turtleBuff: 0, isAI: false },
      ],
      rollDice: () => rolls.shift(),
    });

    const firstState = await engine.takeTurn();

    expect(firstState.players[0].position).toBe(27);
    expect(firstState.currentPlayerIndex).toBe(0);

    const secondState = await engine.takeTurn();

    expect(secondState.lastAction).toMatchObject({
      playerId: 'crew-1',
      from: 27,
      to: 29,
    });
  });

  it('applies a next-turn speed boost from the gem reef sticker cell', async () => {
    const rolls = [1, 3];
    const engine = createGameEngine({
      players: [{ id: 'crew-1', name: 'A', position: 35, skipTurns: 0, turtleBuff: 0, isAI: false }],
      rollDice: () => rolls.shift(),
    });

    const setupState = await engine.takeTurn();

    expect(setupState.players[0].position).toBe(36);

    const boostedState = await engine.takeTurn();

    expect(boostedState.lastAction).toMatchObject({
      from: 36,
      moveBy: 4,
      to: 40,
    });
  });
});
