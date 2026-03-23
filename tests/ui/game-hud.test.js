import { describe, expect, it } from 'vitest';
import { getPlayerBadgeText } from '../../src/core/players.js';
import { renderGameHud } from '../../src/ui/game-hud.js';

describe('game HUD', () => {
  it('renders a floating dice button while surfacing the current player by name', () => {
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
        soundMuted: false,
      },
    });

    const drawer = root.querySelector('[data-role="hud-drawer"]');
    const currentPlayerBanner = root.querySelector('[data-role="current-player-banner"]');
    const soundToggle = root.querySelector('[data-role="sound-toggle"]');
    const turnPill = root.querySelector('[data-role="turn-pill"]');

    expect(root.textContent).toContain('小船长');
    expect(root.textContent).toContain('第 4 回合');
    expect(root.querySelector('[data-role="roll-action"]')).not.toBeNull();
    expect(root.querySelector('[data-role="hud-toggle"]')).not.toBeNull();
    expect(turnPill).not.toBeNull();
    expect(turnPill?.textContent).toContain('小船长');
    expect(root.querySelector('.hud-mini__current-badge')?.textContent).toBe(getPlayerBadgeText('小船长', 1));
    expect(root.querySelector('.hud-legend__badge')?.textContent).toBe(getPlayerBadgeText('小船长', 1));
    expect(drawer).not.toBeNull();
    expect(drawer?.hasAttribute('open')).toBe(false);
    expect(currentPlayerBanner).not.toBeNull();
    expect(currentPlayerBanner?.contains(soundToggle)).toBe(true);
    expect(drawer?.contains(root.querySelector('[data-role="current-player-banner"]'))).toBe(true);
    expect(drawer?.contains(root.querySelector('[data-role="player-legend"]'))).toBe(true);
    expect(drawer?.contains(root.querySelector('[data-role="event-note"]'))).toBe(true);
    expect(root.querySelector('[data-role="zone-objective-card"]')).toBeNull();
    expect(root.querySelector('[data-role="crew-strip"]')).toBeNull();
    expect(soundToggle).not.toBeNull();
  });

  it('shows a rolling dice state with the live face value while a turn animation is playing', () => {
    const root = document.createElement('div');

    renderGameHud(root, {
      state: {
        turnNumber: 2,
        currentPlayer: { id: 'crew-1', name: '小船长', color: '#ff6b6b', position: 11 },
        crew: [
          { id: 'crew-1', name: '小船长', color: '#ff6b6b', position: 11 },
          { id: 'crew-2', name: '海盗甲', color: '#4ecdc4', position: 8 },
        ],
        recentEvent: { title: '海浪推着船队前进' },
        animation: {
          phase: 'rolling',
          diceValue: 5,
          rollValue: 4,
        },
      },
    });

    const rollButton = root.querySelector('[data-role="roll-action"]');

    expect(rollButton?.dataset.motion).toBe('rolling');
    expect(rollButton?.textContent).toContain('摇骰中');
    expect(rollButton?.textContent).toContain('5');
  });
});
