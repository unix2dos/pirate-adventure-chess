import { describe, expect, it } from 'vitest';
import { renderInfoOverlay } from '../../src/ui/info-overlay.js';

describe('info overlay', () => {
  it('renders sticker teaching details with trigger, effect, and example copy', () => {
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
    expect(root.textContent).toContain('幸运骰');
    expect(root.textContent).toContain('第 27 格');
    expect(root.textContent).toContain('落到第 27 格时触发');
    expect(root.textContent).toContain('处理完本格后，仍然轮到你继续掷骰');
    expect(root.textContent).toContain('例如你从第 26 格走到第 27 格');

    root.querySelector('[data-role="close-info-overlay"]').click();
    expect(closed).toBe(true);
  });

  it('supports sheet mode for small screens', () => {
    const root = document.createElement('div');

    renderInfoOverlay(root, {
      layout: 'sheet',
      detail: {
        title: '规则说明',
        trigger: '点击挂卡可查看说明',
        effectText: '帮助入口会解释常见规则类型。',
      },
      onClose() {},
    });

    expect(root.querySelector('[data-role="info-overlay"]')?.dataset.layout).toBe('sheet');
  });
});
