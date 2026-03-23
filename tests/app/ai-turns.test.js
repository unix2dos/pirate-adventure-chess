import { afterEach, describe, expect, it, vi } from 'vitest';

function stubCanvasContext() {
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
}

function createSoundEngineStub() {
  return {
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
}

describe('AI turns', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('automatically plays the next AI turn after the human turn settles', async () => {
    vi.useFakeTimers();
    stubCanvasContext();
    document.body.innerHTML = '<div id="app"></div>';

    const rollDice = vi.fn()
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(3);

    const { createApp } = await import('../../src/app/app.js');
    const root = document.getElementById('app');

    createApp(root, {
      soundEngine: createSoundEngineStub(),
      rollDice,
    });

    root.querySelector('[data-role="start-adventure"]').click();
    root.querySelector('[data-role="roll-action"]').click();

    await vi.runAllTimersAsync();
    await Promise.resolve();

    expect(rollDice).toHaveBeenCalledTimes(2);
    expect(root.textContent).toContain('第 2 回合');
    expect(root.textContent).toContain('你');
  });
});
