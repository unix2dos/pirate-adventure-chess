import { describe, expect, it } from 'vitest';
import { renderStartScreen } from '../../src/ui/start-screen.js';

describe('start screen', () => {
  it('starts in 1-player-plus-ai mode without exposing the old player-count picker', () => {
    const root = document.createElement('div');
    let payload = null;

    renderStartScreen(root, {
      onStart(config) {
        payload = config;
      },
    });

    expect(root.querySelector('[data-role="count-picker"]')).toBeNull();
    expect(root.querySelectorAll('[data-count]')).toHaveLength(0);
    expect(root.querySelector('[data-mode="solo-ai"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelector('[data-mode="local-duo"]')?.getAttribute('aria-pressed')).toBe('false');
    expect(root.querySelector('#player-name-1')).toBeNull();

    root.querySelector('#player-name-0').value = '小船长';
    root.querySelector('[data-role="start-adventure"]').click();

    expect(payload.players).toHaveLength(2);
    expect(payload.players[0].name).toBe('小船长');
    expect(payload.players[0].isAI).toBe(false);
    expect(payload.players[1]).toEqual({
      name: '海盗1',
      isAI: true,
    });
  });

  it('lets the user switch to local two-player mode and name the second captain', () => {
    const root = document.createElement('div');
    let payload = null;

    renderStartScreen(root, {
      onStart(config) {
        payload = config;
      },
    });

    root.querySelector('[data-mode="local-duo"]').click();

    const secondNameInput = root.querySelector('#player-name-1');

    expect(root.querySelector('[data-mode="solo-ai"]')?.getAttribute('aria-pressed')).toBe('false');
    expect(root.querySelector('[data-mode="local-duo"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(secondNameInput).not.toBeNull();

    root.querySelector('#player-name-0').value = '姐姐';
    secondNameInput.value = '弟弟';
    root.querySelector('[data-role="start-adventure"]').click();

    expect(payload.players).toEqual([
      { name: '姐姐', isAI: false },
      { name: '弟弟', isAI: false },
    ]);
  });
});
