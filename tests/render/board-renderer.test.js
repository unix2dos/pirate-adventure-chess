import { describe, expect, it } from 'vitest';
import { getPlayerBadgeText } from '../../src/core/players.js';
import { renderBoardRenderer } from '../../src/render/board-renderer.js';

describe('board renderer', () => {
  it('renders a playful board with decorated event stickers, finish stage details, and layered player chips', () => {
    const root = document.createElement('div');
    root.style.position = 'relative';
    HTMLCanvasElement.prototype.getContext = () => ({
      beginPath() {},
      moveTo() {},
      lineTo() {},
      stroke() {},
      fill() {},
      arc() {},
      fillRect() {},
      strokeRect() {},
      clearRect() {},
      createLinearGradient() {
        return { addColorStop() {} };
      },
      createRadialGradient() {
        return { addColorStop() {} };
      },
      save() {},
      restore() {},
      translate() {},
      scale() {},
      ellipse() {},
      quadraticCurveTo() {},
      closePath() {},
      fillText() {},
      setLineDash() {},
    });

    renderBoardRenderer(root, {
      state: {
        currentPlayer: { id: 'crew-1', position: 7, color: '#ff6b6b' },
        crew: [
          { id: 'crew-1', position: 7, color: '#ff6b6b', name: '你' },
          { id: 'crew-2', position: 12, color: '#4ecdc4', name: '海盗1' },
        ],
        animation: {
          phase: 'moving',
          playerId: 'crew-1',
          trail: [8, 9, 10, 11],
          activeCell: 11,
          landedCell: 11,
        },
      },
    });

    const canvas = root.querySelector('[data-role="board-canvas"]');

    expect(canvas?.width).toBe(1440);
    expect(canvas?.height).toBe(900);
    expect(root.querySelector('[data-cell-label="1"]')).not.toBeNull();
    expect(root.querySelector('[data-cell-label="12"]')).not.toBeNull();
    expect(root.querySelector('[data-cell-label="100"]')).not.toBeNull();
    expect(root.querySelector('[data-player-chip="1"]')).not.toBeNull();
    expect(root.querySelector('[data-player-chip="2"]')).not.toBeNull();
    expect(root.querySelector('[data-role="board-center-sign"]')).not.toBeNull();
    expect(root.querySelector('[data-role="board-finish-sparkles"]')).not.toBeNull();
    expect(root.querySelector('[data-role="board-finish-banner"]')).toBeNull();
    expect(root.querySelector('[data-player-chip="1"] .board-player-chip__ring')).not.toBeNull();
    expect(root.querySelector('[data-player-chip="1"] .board-player-chip__shadow')).not.toBeNull();
    expect(root.querySelector('[data-player-chip="1"] .board-player-chip__badge')?.textContent).toBe(getPlayerBadgeText('你', 1));
    expect(root.querySelector('[data-player-chip="2"] .board-player-chip__badge')?.textContent).toBe(getPlayerBadgeText('海盗1', 2));
    expect(root.querySelector('[data-board-sticker="wish-star"] .board-sticker__icon')).not.toBeNull();
    expect(root.querySelector('[data-board-sticker="bonus-roll"] .board-sticker__icon')).not.toBeNull();
    expect(root.querySelector('[data-board-sticker="bonus-roll"]')?.getAttribute('title')).toContain('再掷一次');
    expect(root.querySelector('[data-cell-label="8"]')?.dataset.trail).toBe('true');
    expect(root.querySelector('[data-cell-label="11"]')?.dataset.active).toBe('true');
    expect(root.querySelector('[data-cell-label="11"]')?.dataset.landed).toBe('true');
    expect(root.querySelector('[data-player-chip="1"]')?.dataset.motion).toBe('moving');
    expect(root.querySelectorAll('[data-board-sticker]').length).toBeGreaterThan(3);
  });
});
