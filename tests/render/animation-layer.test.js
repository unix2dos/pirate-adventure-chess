import { describe, expect, it } from 'vitest';
import { renderAnimationLayer } from '../../src/render/animation-layer.js';

describe('animation layer', () => {
  it('stores the active motion phase and dice value while highlighting the moving trail', () => {
    const root = document.createElement('div');
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
      setLineDash() {},
    });

    renderAnimationLayer(root, {
      state: {
        currentPlayer: { position: 11 },
        animation: {
          phase: 'moving',
          diceValue: 4,
          trail: [8, 9, 10, 11],
          activeCell: 11,
        },
      },
      size: { width: 1440, height: 900 },
    });

    const canvas = root.querySelector('[data-role="animation-canvas"]');

    expect(canvas?.dataset.phase).toBe('moving');
    expect(canvas?.dataset.diceValue).toBe('4');
    expect(canvas?.dataset.activeCell).toBe('11');
    expect(canvas?.dataset.trail).toBe('8,9,10,11');
  });

  it('renders safely when no animation state is present yet', () => {
    const root = document.createElement('div');
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
      setLineDash() {},
    });

    expect(() => renderAnimationLayer(root, {
      state: {
        currentPlayer: { position: 3 },
      },
      size: { width: 1440, height: 900 },
    })).not.toThrow();
  });
});
