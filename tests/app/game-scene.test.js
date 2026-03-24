import { describe, expect, it } from 'vitest';

function createSoundEngineStub() {
  return {
    isMuted: () => false,
    setMuted: () => {},
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
  it('opens a sticker detail overlay when a rule card is clicked', async () => {
    stubCanvasContext();
    document.body.innerHTML = '<div id="app"></div>';
    const { createApp } = await import('../../src/app/app.js');
    const root = document.getElementById('app');

    createApp(root, { soundEngine: createSoundEngineStub() });
    root.querySelector('[data-role="start-adventure"]').click();
    root.querySelector('[data-board-sticker="bonus-roll"]').click();

    expect(root.querySelector('[data-role="info-overlay"]')).not.toBeNull();
    expect(root.textContent).toContain('幸运骰');
    expect(root.textContent).toContain('第 27 格');
    expect(root.textContent).toContain('再掷一次');
  });

  it('opens a help overlay from the settings drawer and can restart back to the start scene', async () => {
    stubCanvasContext();
    document.body.innerHTML = '<div id="app"></div>';
    const { createApp } = await import('../../src/app/app.js');
    const root = document.getElementById('app');

    createApp(root, { soundEngine: createSoundEngineStub() });
    root.querySelector('[data-role="start-adventure"]').click();
    root.querySelector('[data-role="help-action"]').click();

    expect(root.querySelector('[data-role="info-overlay"]')).not.toBeNull();
    expect(root.textContent).toContain('规则说明');
    expect(root.textContent).toContain('点击挂卡');

    root.querySelector('[data-role="restart-action"]').click();

    expect(root.querySelector('[data-scene="start"]')).not.toBeNull();
    expect(root.querySelector('[data-scene="game"]')).toBeNull();
  });
});
