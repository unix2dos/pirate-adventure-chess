import { describe, expect, it } from 'vitest';
import { getPlayerBadgeText } from '../../src/core/players.js';
import { renderGameHud } from '../../src/ui/game-hud.js';

describe('game HUD', () => {
  it('renders a current-player pill and a settings drawer without the old status panels', () => {
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
    const soundToggle = root.querySelector('[data-role="sound-toggle"]');
    const turnPill = root.querySelector('[data-role="turn-pill"]');

    expect(root.textContent).toContain('小船长');
    expect(root.textContent).toContain('第 4 回合');
    expect(root.textContent).toContain('第 18 格');
    expect(root.querySelector('[data-role="roll-action"]')).not.toBeNull();
    expect(root.querySelector('[data-role="hud-toggle"]')).not.toBeNull();
    expect(turnPill).not.toBeNull();
    expect(turnPill?.textContent).toContain('小船长');
    expect(turnPill?.textContent).toContain('第 4 回合');
    expect(root.querySelector('.hud-turn-pill__avatar')?.textContent).toBe(getPlayerBadgeText('小船长', 1));
    expect(drawer).not.toBeNull();
    expect(drawer?.hasAttribute('open')).toBe(false);
    expect(root.querySelector('[data-role="current-player-banner"]')).toBeNull();
    expect(root.querySelector('[data-role="player-legend"]')).toBeNull();
    expect(root.querySelector('[data-role="event-note"]')).toBeNull();
    expect(root.querySelector('[data-role="help-action"]')).not.toBeNull();
    expect(root.querySelector('[data-role="restart-action"]')).not.toBeNull();
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

  it('renders the top-left current-player pill even before any dice roll happens', () => {
    const root = document.createElement('div');

    renderGameHud(root, {
      state: {
        turnNumber: 1,
        currentPlayer: { id: 'crew-1', name: '小船长', color: '#ff6b6b', position: 1 },
        crew: [
          { id: 'crew-1', name: '小船长', color: '#ff6b6b', position: 1 },
          { id: 'crew-2', name: '海盗甲', color: '#4ecdc4', position: 1 },
        ],
        recentEvent: { title: '准备出航' },
      },
    });

    expect(root.querySelector('[data-role="turn-pill"]')).not.toBeNull();
    expect(root.querySelector('[data-role="turn-pill"]')?.textContent).toContain('第 1 回合');
  });

  it('renders a compact bottom action bar for portrait mobile layouts', () => {
    const root = document.createElement('div');

    renderGameHud(root, {
      layout: { mode: 'mobile-portrait' },
      state: {
        turnNumber: 3,
        currentPlayer: { id: 'crew-1', name: '小船长', color: '#ff6b6b', position: 9 },
        crew: [
          { id: 'crew-1', name: '小船长', color: '#ff6b6b', position: 9 },
          { id: 'crew-2', name: '海盗甲', color: '#4ecdc4', position: 7 },
        ],
        recentEvent: { title: '准备出航' },
      },
    });

    const hudRoot = root.querySelector('[data-scene="game-hud"]');
    const primaryBar = root.querySelector('[data-role="hud-primary-bar"]');

    expect(hudRoot?.dataset.layout).toBe('mobile-portrait');
    expect(primaryBar).not.toBeNull();
    expect(primaryBar?.contains(root.querySelector('[data-role="hud-drawer"]'))).toBe(true);
    expect(primaryBar?.contains(root.querySelector('[data-role="roll-action"]'))).toBe(true);
  });
});
