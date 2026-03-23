import { describe, expect, it } from 'vitest';
import { renderBoardRenderer } from '../../src/render/board-renderer.js';

describe('board renderer', () => {
  it('renders visible board numbers on a widescreen board with numbered player chips', () => {
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
    expect(root.querySelectorAll('[data-board-sticker]').length).toBeGreaterThan(3);
  });
});
