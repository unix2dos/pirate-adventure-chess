import { describe, expect, it } from 'vitest';
import { createDefaultPlayerConfigs, createPlayer } from '../../src/core/players.js';

describe('players', () => {
  it('creates a local player with defaults', () => {
    expect(createPlayer({ id: 0, name: 'You', color: '#ff6b6b' })).toMatchObject({
      id: 0,
      name: 'You',
      position: 1,
      isAI: false,
      skipTurns: 0,
      turtleBuff: 0,
    });
  });

  it('creates default configs for a 1-player game with AI fill enabled', () => {
    expect(createDefaultPlayerConfigs({ count: 1, useAI: true })[1]).toMatchObject({
      isAI: true,
    });
  });
});
