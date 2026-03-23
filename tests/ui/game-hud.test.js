import { describe, expect, it } from 'vitest';
import { renderGameHud } from '../../src/ui/game-hud.js';

describe('game HUD', () => {
  it('renders a floating dice button with a persistent turn pill while the rest stays folded away', () => {
    const root = document.createElement('div');

    renderGameHud(root, {
      state: {
        turnNumber: 4,
        currentPlayer: { id: 'crew-1', name: '小船长', color: '#ff6b6b', position: 18 },
        crew: [
          { id: 'crew-1', name: '小船长', color: '#ff6b6b', position: 18 },
          { id: 'crew-2', name: '海盗甲', color: '#4ecdc4', position: 16 },
        ],
        recentEvent: { title: '海豚快线' },
      },
    });

    const drawer = root.querySelector('[data-role="hud-drawer"]');
    const turnPill = root.querySelector('[data-role="turn-pill"]');

    expect(root.textContent).toContain('小船长');
    expect(root.querySelector('[data-role="roll-action"]')).not.toBeNull();
    expect(root.querySelector('[data-role="hud-toggle"]')).not.toBeNull();
    expect(turnPill).not.toBeNull();
    expect(turnPill?.textContent).toContain('4');
    expect(turnPill?.textContent).toContain('小船长');
    expect(drawer).not.toBeNull();
    expect(drawer?.hasAttribute('open')).toBe(false);
    expect(drawer?.contains(turnPill)).toBe(false);
    expect(drawer?.contains(root.querySelector('[data-role="current-player-banner"]'))).toBe(true);
    expect(drawer?.contains(root.querySelector('[data-role="player-legend"]'))).toBe(true);
    expect(drawer?.contains(root.querySelector('[data-role="event-note"]'))).toBe(true);
    expect(root.querySelector('[data-role="zone-objective-card"]')).toBeNull();
    expect(root.querySelector('[data-role="crew-strip"]')).toBeNull();
  });
});
