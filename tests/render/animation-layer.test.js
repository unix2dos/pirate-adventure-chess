import { describe, expect, it } from 'vitest';
import { renderAnimationLayer } from '../../src/render/animation-layer.js';

describe('animation layer', () => {
  it('stores the active motion phase and dice value while highlighting the moving trail without drawing a dice link', () => {
    const root = document.createElement('div');
    const calls = {
      lineTo: 0,
      quadraticCurveTo: 0,
      arc: 0,
    };
    HTMLCanvasElement.prototype.getContext = () => ({
      beginPath() {},
      moveTo() {},
      lineTo() {
        calls.lineTo += 1;
      },
      quadraticCurveTo() {
        calls.quadraticCurveTo += 1;
      },
      stroke() {},
      fill() {},
      arc() {
        calls.arc += 1;
      },
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
    expect(calls.lineTo).toBeGreaterThan(0);
    expect(calls.arc).toBeGreaterThan(0);
    expect(calls.quadraticCurveTo).toBe(0);
  });

  it('renders safely when no animation state is present yet', () => {
    const root = document.createElement('div');
    HTMLCanvasElement.prototype.getContext = () => ({
      beginPath() {},
      moveTo() {},
      lineTo() {},
      quadraticCurveTo() {},
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
