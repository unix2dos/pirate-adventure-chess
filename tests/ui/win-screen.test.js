import { describe, expect, it } from 'vitest';
import { renderWinScreen } from '../../src/ui/win-screen.js';

describe('win screen', () => {
  it('renders the winner and invokes replay', () => {
    const root = document.createElement('div');
    let replayed = false;

    renderWinScreen(root, {
      winner: { name: '小船长' },
      ranking: [{ name: '小船长', position: 100, color: '#ff6b6b' }],
      onReplay() {
        replayed = true;
      },
    });

    expect(root.textContent).toContain('小船长');
    root.querySelector('[data-role="replay"]').click();
    expect(replayed).toBe(true);
  });
});
