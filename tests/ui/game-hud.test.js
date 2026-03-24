import { describe, expect, it } from 'vitest';
import { renderGameHud } from '../../src/ui/game-hud.js';

describe('game HUD', () => {
  it('renders a bottom status bar and keeps settings drawer sound-only controls', () => {
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
        bgmMuted: false,
        sfxMuted: false,
        currentPlayerStatus: ['冻结'],
      },
    });

    const drawer = root.querySelector('[data-role="hud-drawer"]');
    const bgmToggle = root.querySelector('[data-role="bgm-toggle"]');
    const sfxToggle = root.querySelector('[data-role="sfx-toggle"]');
    const statusBar = root.querySelector('[data-role="turn-status-bar"]');

    expect(root.textContent).toContain('小船长');
    expect(root.textContent).toContain('回合 4');
    expect(root.textContent).toContain('冻结');
    expect(root.querySelector('[data-role="roll-action"]')).not.toBeNull();
    expect(root.querySelector('[data-role="hud-toggle"]')).not.toBeNull();
    expect(statusBar).not.toBeNull();
    expect(statusBar?.textContent).toContain('小船长');
    expect(statusBar?.textContent).toContain('回合 4');
    expect(statusBar?.textContent).toContain('冻结');
    expect(root.querySelector('.hud-turn-pill')).toBeNull();
    expect(root.querySelector('.hud-turn-pill__avatar')).toBeNull();
    expect(drawer).not.toBeNull();
    expect(drawer?.hasAttribute('open')).toBe(false);
    expect(root.querySelector('[data-role="current-player-banner"]')).toBeNull();
    expect(root.querySelector('[data-role="player-legend"]')).toBeNull();
    expect(root.querySelector('[data-role="event-note"]')).toBeNull();
    expect(root.querySelector('[data-role="help-action"]')).toBeNull();
    expect(root.querySelector('[data-role="restart-action"]')).toBeNull();
    expect(bgmToggle).not.toBeNull();
    expect(sfxToggle).not.toBeNull();
    expect(bgmToggle?.getAttribute('aria-pressed')).toBe('false');
    expect(sfxToggle?.getAttribute('aria-pressed')).toBe('false');
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

  it('renders status bar instead of top-left current-player pill before first roll', () => {
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

    expect(root.querySelector('[data-role="turn-pill"]')).toBeNull();
    expect(root.querySelector('[data-role="turn-status-bar"]')).not.toBeNull();
    expect(root.querySelector('[data-role="turn-status-bar"]')?.textContent).toContain('回合 1');
  });

  it('keeps portrait mobile controls attached on top of the board instead of docking a bottom bar', () => {
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
    const settingsDrawer = root.querySelector('[data-role="hud-drawer"]');
    const rollAction = root.querySelector('[data-role="roll-action"]');

    expect(hudRoot?.dataset.layout).toBe('mobile-portrait');
    expect(hudRoot?.dataset.density).toBe('compact');
    expect(primaryBar).not.toBeNull();
    expect(primaryBar?.dataset.attach).toBe('top');
    expect(primaryBar?.contains(settingsDrawer)).toBe(true);
    expect(primaryBar?.contains(rollAction)).toBe(true);
  });
});
