import { describe, expect, it } from 'vitest';
import { renderGameHud } from '../../src/ui/game-hud.js';

describe('game HUD', () => {
  it('renders a compact sidebar focused on turn info and the roll action', () => {
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

    expect(root.textContent).toContain('小船长');
    expect(root.querySelector('[data-role="player-legend"]')).not.toBeNull();
    expect(root.querySelector('[data-role="event-note"]')).not.toBeNull();
    expect(root.querySelector('[data-role="roll-action"]')).not.toBeNull();
    expect(root.querySelector('[data-role="zone-objective-card"]')).toBeNull();
    expect(root.querySelector('[data-role="crew-strip"]')).toBeNull();
  });
});
