import { describe, expect, it } from 'vitest';
import { renderInfoOverlay } from '../../src/ui/info-overlay.js';

describe('info overlay', () => {
  it('renders only effect copy and removes other rule details', () => {
    const root = document.createElement('div');
    let closed = false;

    renderInfoOverlay(root, {
      layout: 'anchored',
      detail: {
        title: '幸运骰',
        cell: 27,
        trigger: '落到第 27 格时触发',
        effectText: '处理完本格后，仍然轮到你继续掷骰',
        example: '例如你从第 26 格走到第 27 格，这回合不会切到下一位玩家。',
      },
      onClose() {
        closed = true;
      },
    });

    expect(root.querySelector('[data-role="info-overlay"]')?.dataset.layout).toBe('anchored');
    expect(root.textContent).toContain('处理完本格后，仍然轮到你继续掷骰');
    expect(root.textContent).not.toContain('幸运骰');
    expect(root.textContent).not.toContain('第 27 格');
    expect(root.textContent).not.toContain('落到第 27 格时触发');
    expect(root.textContent).not.toContain('例如你从第 26 格走到第 27 格');
    expect(root.querySelector('[data-role="info-overlay-card"]')?.classList.contains('info-overlay__card--effect')).toBe(true);

    root.querySelector('[data-role="close-info-overlay"]').click();
    expect(closed).toBe(true);
  });

  it('supports modal mode for compact screens while keeping dialog semantics', () => {
    const root = document.createElement('div');

    renderInfoOverlay(root, {
      layout: 'modal',
      detail: { effectText: '帮助入口会解释常见规则类型。' },
      onClose() {},
    });

    expect(root.querySelector('[data-role="info-overlay"]')?.dataset.layout).toBe('modal');
    expect(root.querySelector('[role="dialog"]')).not.toBeNull();
    expect(root.querySelector('.overlay-title')).toBeNull();
  });

  it('closes when clicking outside of the overlay card', () => {
    const root = document.createElement('div');
    let closeCount = 0;

    renderInfoOverlay(root, {
      layout: 'anchored',
      detail: { effectText: '下一次轮到你时跳过' },
      onClose() {
        closeCount += 1;
      },
    });

    root.querySelector('[data-role="info-overlay"]').click();
    expect(closeCount).toBe(1);
  });
});
