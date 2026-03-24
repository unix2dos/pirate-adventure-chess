import { describe, expect, it } from 'vitest';
import { boardPath } from '../../src/core/board-data.js';
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
    expect(root.querySelector('[data-board-sticker="bonus-roll"]')?.getAttribute('title')).toContain('第 27 格');
    expect(root.querySelector('[data-board-sticker="bonus-roll"]')?.getAttribute('title')).toContain('再掷一次');
    expect(root.querySelector('[data-board-sticker-link="wish-star"]')).not.toBeNull();
    expect(root.querySelector('[data-board-sticker-link="bonus-roll"]')).not.toBeNull();
    expect(root.querySelector('[data-cell-label="27"]')?.dataset.landmarkStyle).toBe('dice');
    expect(root.querySelector('[data-cell-label="46"]')?.dataset.landmarkStyle).toBe('octopus');
    expect(root.querySelector('[data-cell-label="60"]')?.dataset.landmarkStyle).toBe('bridge');
    expect(root.querySelector('[data-cell-label="27"]')?.className).toContain('board-cell-label--landmark-dice');
    expect(root.querySelector('[data-cell-label="46"]')?.className).toContain('board-cell-label--landmark-octopus');
    expect(root.querySelector('[data-cell-label="60"]')?.className).toContain('board-cell-label--landmark-bridge');
    expect(root.querySelector('[data-cell-label="83"]')?.className).not.toContain('board-cell-label--final-bend');
    expect(root.querySelector('[data-cell-label="90"]')?.className).not.toContain('board-cell-label--finish-lane');
    expect(root.querySelector('[data-cell-label="90"]')?.dataset.finishLane).toBe('false');
    expect(root.querySelector('[data-cell-label="83"]')?.dataset.finalBend).toBe('false');
    expect(root.querySelector('[data-cell-label="8"]')?.dataset.trail).toBe('true');
    expect(root.querySelector('[data-cell-label="11"]')?.dataset.active).toBe('true');
    expect(root.querySelector('[data-cell-label="11"]')?.dataset.landed).toBe('true');
    expect(root.querySelector('[data-player-chip="1"]')?.dataset.motion).toBe('moving');
    expect(root.querySelectorAll('[data-board-sticker]').length).toBeGreaterThan(3);
  });

  it('lifts the center island so the sand stage stays centered inside the inner route', () => {
    const root = document.createElement('div');
    const ellipseCalls = [];
    const originalGetContext = HTMLCanvasElement.prototype.getContext;

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
      ellipse(...args) {
        ellipseCalls.push(args);
      },
      quadraticCurveTo() {},
      closePath() {},
      fillText() {},
      setLineDash() {},
    });

    try {
      renderBoardRenderer(root, {
        state: {
          currentPlayer: { id: 'crew-1', position: 1, color: '#ff6b6b' },
          crew: [{ id: 'crew-1', position: 1, color: '#ff6b6b', name: '你' }],
        },
      });
    } finally {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    }

    const [sandEllipse] = ellipseCalls;
    const innerRoute = boardPath.filter(({ index }) => index >= 82 && index <= 99);
    const innerXs = innerRoute.map(({ x }) => x);
    const innerYs = innerRoute.map(({ y }) => y);
    const innerCenterX = ((Math.min(...innerXs) + Math.max(...innerXs)) / 2) * 1440;
    const innerCenterY = ((Math.min(...innerYs) + Math.max(...innerYs)) / 2) * 900;
    const centerSign = root.querySelector('[data-role="board-center-sign"]');

    expect(sandEllipse).toBeDefined();
    expect(sandEllipse[0]).toBeCloseTo(innerCenterX, 0);
    expect(sandEllipse[1]).toBeCloseTo(innerCenterY, 0);
    expect(sandEllipse[3]).toBeLessThanOrEqual(96);
    expect(centerSign?.getAttribute('style')).toContain(`left:${(((Math.min(...innerXs) + Math.max(...innerXs)) / 2) * 100).toFixed(2)}%`);
    expect(centerSign?.getAttribute('style')).toContain(`top:${(((Math.min(...innerYs) + Math.max(...innerYs)) / 2) * 100).toFixed(2)}%`);
  });
});
