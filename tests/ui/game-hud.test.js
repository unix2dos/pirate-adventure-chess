import { describe, expect, it } from 'vitest';
import { renderGameHud } from '../../src/ui/game-hud.js';

describe('game HUD', () => {
  it('shows the current player and primary action label', () => {
    const root = document.createElement('div');

    renderGameHud(root, {
      state: {
        turnNumber: 4,
        currentPlayer: { name: '小船长', color: '#ff6b6b' },
        recentEvent: { title: '海豚快线' },
      },
    });

    expect(root.textContent).toContain('小船长');
    expect(root.querySelector('[data-role="roll-action"]')).not.toBeNull();
  });
});
