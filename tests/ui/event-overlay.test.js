import { describe, expect, it } from 'vitest';
import { renderEventOverlay } from '../../src/ui/event-overlay.js';

describe('event overlay', () => {
  it('renders choices and resolves the selected value', () => {
    const root = document.createElement('div');
    let selected = null;

    renderEventOverlay(root, {
      event: {
        emoji: '⭐',
        title: '许愿星',
        description: '选择前进几格',
        choices: [{ label: '+2格', value: 2 }],
      },
      onResolve(value) {
        selected = value;
      },
    });

    root.querySelector('button').click();
    expect(selected).toBe(2);
  });
});
