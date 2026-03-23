import { describe, expect, it } from 'vitest';
import { getPlayerBadgeText } from '../../src/core/players.js';

describe('player identity helpers', () => {
  it('creates compact badge labels from player names', () => {
    expect(getPlayerBadgeText('小船长', 1)).toBe('船长');
    expect(getPlayerBadgeText('海盗1', 2)).toBe('海1');
    expect(getPlayerBadgeText('Alice Bob', 3)).toBe('AB');
    expect(getPlayerBadgeText('', 4)).toBe('P4');
  });
});
