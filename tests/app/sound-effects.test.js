import { afterEach, describe, expect, it, vi } from 'vitest';

describe('app sound effects', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('plays dice, movement, and landing cues across a turn', async () => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div id="app"></div>';
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

    const soundEngine = {
      unlock: vi.fn(async () => true),
      isMuted: vi.fn(() => false),
      setMuted: vi.fn(),
      playDicePress: vi.fn(),
      playDiceRollTick: vi.fn(),
      playDiceStop: vi.fn(),
      playStepHop: vi.fn(),
      playLandingBloom: vi.fn(),
      playEventSpark: vi.fn(),
      playTreasureWin: vi.fn(),
    };

    const { createApp } = await import('../../src/app/app.js');
    const root = document.getElementById('app');

    createApp(root, {
      soundEngine,
      rollDice: async () => 4,
    });

    root.querySelector('[data-mode="local-duo"]').click();

    root.querySelector('[data-role="start-adventure"]').click();
    root.querySelector('[data-role="roll-action"]').click();

    await vi.runAllTimersAsync();
    await Promise.resolve();

    expect(soundEngine.unlock).toHaveBeenCalledTimes(1);
    expect(soundEngine.playDicePress).toHaveBeenCalledTimes(1);
    expect(soundEngine.playDiceRollTick).toHaveBeenCalled();
    expect(soundEngine.playDiceStop).toHaveBeenCalledWith({ value: 4 });
    expect(soundEngine.playStepHop).toHaveBeenCalledTimes(4);
    expect(soundEngine.playLandingBloom).toHaveBeenCalledWith({ isEvent: false, isWin: false });
  });
});
