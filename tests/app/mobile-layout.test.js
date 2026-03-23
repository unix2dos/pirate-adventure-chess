import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
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

function readProjectFile(relativePath) {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');
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

describe('mobile game layout', () => {
  it('renders the board stage and hud stage as siblings so portrait layouts can dock controls below the board', async () => {
    stubCanvasContext();
    document.body.innerHTML = '<div id="app"></div>';
    const { createApp } = await import('../../src/app/app.js');
    const root = document.getElementById('app');

    createApp(root, { soundEngine: createSoundEngineStub() });

    root.querySelector('[data-role="start-adventure"]').click();

    const gameLayout = root.querySelector('.game-layout');
    const boardStage = root.querySelector('[data-role="board-stage"]');
    const hudStage = root.querySelector('[data-role="hud-stage"]');

    expect(root.querySelector('[data-scene="game"]')).not.toBeNull();
    expect(gameLayout).not.toBeNull();
    expect(gameLayout?.contains(boardStage)).toBe(true);
    expect(gameLayout?.contains(hudStage)).toBe(true);
    expect(boardStage?.contains(hudStage)).toBe(false);
  });

  it('defines portrait-specific mobile rules and dynamic viewport sizing for the game scene', () => {
    const baseCss = readProjectFile('../../src/styles/base.css');
    const layoutCss = readProjectFile('../../src/styles/layout.css');

    expect(baseCss).toContain('100dvh');
    expect(layoutCss).toContain('@media (max-width: 640px) and (orientation: portrait)');
    expect(layoutCss).toContain('.hud-stage-shell');
    expect(layoutCss).toContain('position: static');
  });
});
