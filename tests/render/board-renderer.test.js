import { describe, expect, it } from 'vitest';
import { renderBoardRenderer } from '../../src/render/board-renderer.js';

describe('board renderer', () => {
  it('renders visible board numbers and numbered player chips', () => {
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

    expect(root.querySelector('[data-cell-label="1"]')).not.toBeNull();
    expect(root.querySelector('[data-cell-label="12"]')).not.toBeNull();
    expect(root.querySelector('[data-cell-label="100"]')).not.toBeNull();
    expect(root.querySelector('[data-player-chip="1"]')).not.toBeNull();
    expect(root.querySelector('[data-player-chip="2"]')).not.toBeNull();
  });
});
