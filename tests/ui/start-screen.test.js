import { describe, expect, it } from 'vitest';
import { renderStartScreen } from '../../src/ui/start-screen.js';

describe('start screen', () => {
  it('collects player setup and emits a normalized config payload', () => {
    const root = document.createElement('div');
    let payload = null;

    renderStartScreen(root, {
      onStart(config) {
        payload = config;
      },
    });

    root.querySelector('[data-count="3"]').click();
    root.querySelector('#player-name-0').value = '小船长';
    root.querySelector('[data-role="start-adventure"]').click();

    expect(payload.players).toHaveLength(3);
    expect(payload.players[0].name).toBe('小船长');
  });
});
