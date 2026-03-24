import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

function readProjectFile(relativePath) {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');
}

describe('style regressions', () => {
  it('defines the new HUD, sticker-link, and info-overlay hooks used by the refreshed board UI', () => {
    const componentsCss = readProjectFile('../../src/styles/components.css');

    expect(componentsCss).toContain('.hud-settings');
    expect(componentsCss).toContain('.hud-turn-pill__meta');
    expect(componentsCss).toContain('.board-sticker-link');
    expect(componentsCss).toContain('.info-overlay');
    expect(componentsCss).toContain('.info-overlay__card');
  });
});
