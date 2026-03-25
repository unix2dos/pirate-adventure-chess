import { describe, expect, it } from 'vitest';

function createSoundEngineStub() {
  let bgmMuted = false;
  let sfxMuted = false;
  return {
    isMuted: () => bgmMuted && sfxMuted,
    isBgmMuted: () => bgmMuted,
    isSfxMuted: () => sfxMuted,
    setMuted: () => {},
    setBgmMuted: (next) => {
      bgmMuted = Boolean(next);
    },
    setSfxMuted: (next) => {
      sfxMuted = Boolean(next);
    },
    unlock: async () => {},
    playDicePress: () => {},
    playDiceRollTick: () => {},
    playDiceStop: () => {},
    playStepHop: () => {},
    playLandingBloom: () => {},
    playEventSpark: () => {},
    playTreasureWin: () => {},
  };
}

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
    setLineDash() {},
  });
}

describe('game scene interactions', () => {
  it('renders prop names directly on board cells instead of floating stickers', async () => {
    stubCanvasContext();
    document.body.innerHTML = '<div id="app"></div>';
    const { createApp } = await import('../../src/app/app.js');
    const root = document.getElementById('app');

    createApp(root, { soundEngine: createSoundEngineStub() });
    root.querySelector('[data-role="start-adventure"]').click();

    expect(root.querySelector('[data-board-sticker]')).toBeNull();
    expect(root.querySelector('[data-cell-label="27"]')?.textContent).toContain('27');
    expect(root.querySelector('[data-cell-label="27"]')?.dataset.eventId).toBeTruthy();
  });

  it('toggles BGM and SFX controls from settings drawer independently', async () => {
    stubCanvasContext();
    document.body.innerHTML = '<div id="app"></div>';
    const { createApp } = await import('../../src/app/app.js');
    const root = document.getElementById('app');
    const soundEngine = createSoundEngineStub();

    createApp(root, { soundEngine });
    root.querySelector('[data-role="start-adventure"]').click();
    root.querySelector('[data-role="hud-toggle"]').click();
    root.querySelector('[data-role="bgm-toggle"]').click();
    root.querySelector('[data-role="sfx-toggle"]').click();

    expect(soundEngine.isBgmMuted()).toBe(true);
    expect(soundEngine.isSfxMuted()).toBe(true);
    expect(root.querySelector('[data-role="bgm-toggle"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelector('[data-role="sfx-toggle"]')?.getAttribute('aria-pressed')).toBe('true');
  });
});
