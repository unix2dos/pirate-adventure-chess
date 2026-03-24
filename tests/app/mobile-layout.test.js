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

function installViewportStub(initialSize = { width: 375, height: 667 }) {
  let currentSize = { ...initialSize };
  const listeners = new Map();

  const visualViewport = {
    get width() {
      return currentSize.width;
    },
    get height() {
      return currentSize.height;
    },
    addEventListener(type, listener) {
      const bucket = listeners.get(type) ?? new Set();
      bucket.add(listener);
      listeners.set(type, bucket);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
  };

  Object.defineProperty(globalThis, 'innerWidth', {
    configurable: true,
    get() {
      return currentSize.width;
    },
  });
  Object.defineProperty(globalThis, 'innerHeight', {
    configurable: true,
    get() {
      return currentSize.height;
    },
  });
  Object.defineProperty(globalThis, 'visualViewport', {
    configurable: true,
    value: visualViewport,
  });

  globalThis.matchMedia = (query) => {
    const compact = currentSize.width <= 820;
    const portrait = currentSize.height >= currentSize.width;

    return {
      matches:
        (query.includes('max-width: 820px') && compact)
        || (query.includes('orientation: portrait') && portrait)
        || (query.includes('orientation: landscape') && !portrait)
        || (query.includes('max-width: 640px') && currentSize.width <= 640),
      media: query,
      addEventListener() {},
      removeEventListener() {},
    };
  };

  return {
    resizeTo(nextSize) {
      currentSize = { ...nextSize };
      globalThis.dispatchEvent(new Event('resize'));
      listeners.get('resize')?.forEach((listener) => listener(new Event('resize')));
    },
  };
}

describe('mobile game layout', () => {
  it('classifies phone portrait and landscape viewports into explicit layout modes', async () => {
    const { getViewportLayoutState } = await import('../../src/app/viewport-layout.js');

    expect(getViewportLayoutState({ width: 375, height: 667 }).mode).toBe('mobile-portrait');
    expect(getViewportLayoutState({ width: 375, height: 667 }).hudDocked).toBe(true);
    expect(getViewportLayoutState({ width: 375, height: 667 }).infoOverlayLayout).toBe('modal');

    expect(getViewportLayoutState({ width: 667, height: 375 }).mode).toBe('mobile-landscape');
    expect(getViewportLayoutState({ width: 667, height: 375 }).hudDocked).toBe(false);
    expect(getViewportLayoutState({ width: 1180, height: 820 }).mode).toBe('desktop');
    expect(getViewportLayoutState({ width: 1180, height: 820 }).infoOverlayLayout).toBe('anchored');
  });

  it('renders the board stage and hud stage as siblings so portrait layouts can dock controls below the board', async () => {
    stubCanvasContext();
    installViewportStub({ width: 375, height: 667 });
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

  it('updates the game scene layout mode when the viewport rotates without leaving the active game scene', async () => {
    stubCanvasContext();
    const viewport = installViewportStub({ width: 375, height: 667 });
    document.body.innerHTML = '<div id="app"></div>';
    const { createApp } = await import('../../src/app/app.js');
    const root = document.getElementById('app');

    createApp(root, { soundEngine: createSoundEngineStub() });
    root.querySelector('[data-role="start-adventure"]').click();

    const initialTurnText = root.querySelector('[data-role="turn-pill"]')?.textContent;

    expect(root.querySelector('[data-scene="game"]')?.dataset.layout).toBe('mobile-portrait');
    expect(root.querySelector('[data-scene="game-hud"]')?.dataset.layout).toBe('mobile-portrait');

    viewport.resizeTo({ width: 667, height: 375 });
    await Promise.resolve();

    expect(root.querySelector('[data-scene="game"]')).not.toBeNull();
    expect(root.querySelector('[data-scene="game"]')?.dataset.layout).toBe('mobile-landscape');
    expect(root.querySelector('[data-scene="game-hud"]')?.dataset.layout).toBe('mobile-landscape');
    expect(root.querySelector('[data-role="turn-pill"]')?.textContent).toBe(initialTurnText);
  });

  it('defines viewport-fit coverage and layout-mode-driven mobile rules for the game scene', () => {
    const html = readProjectFile('../../index.html');
    const baseCss = readProjectFile('../../src/styles/base.css');
    const layoutCss = readProjectFile('../../src/styles/layout.css');
    const scenesCss = readProjectFile('../../src/styles/scenes.css');
    const componentsCss = readProjectFile('../../src/styles/components.css');

    expect(html).toContain('viewport-fit=cover');
    expect(baseCss).toContain('--viewport-width');
    expect(baseCss).toContain('--viewport-height');
    expect(layoutCss).toContain('[data-layout="mobile-portrait"]');
    expect(layoutCss).toContain('--hud-dock-height');
    expect(layoutCss).toContain('aspect-ratio: 16 / 10');
    expect(componentsCss).toContain('[data-role="hud-primary-bar"]');
    expect(componentsCss).toContain('.info-overlay[data-layout=\'modal\']');
    expect(scenesCss).toContain('--scene-padding: 0');
    expect(scenesCss).toContain('.start-panel');
    expect(scenesCss).toContain('order: -1');
  });
});
