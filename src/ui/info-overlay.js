function readAnchorStyle(anchor = {}) {
  if (!anchor || typeof anchor.left !== 'number' || typeof anchor.top !== 'number') {
    return '';
  }

  const maxWidth = typeof anchor.maxWidth === 'number' ? anchor.maxWidth : 340;
  return `left:${anchor.left}px;top:${anchor.top}px;max-width:${maxWidth}px;`;
}

function normalizeLayout(layout = 'anchored') {
  return layout === 'sheet' ? 'modal' : layout;
}

export function renderInfoOverlay(root, { detail = {}, layout = 'anchored', anchor = null, onClose }) {
  const normalizedLayout = normalizeLayout(layout);
  const isDialogLayout = normalizedLayout !== 'anchored';

  root.innerHTML = `
    <section
      data-role="info-overlay"
      class="info-overlay"
      data-layout="${normalizedLayout}"
      ${isDialogLayout ? 'role="dialog" aria-modal="true"' : ''}
    >
      <article class="info-overlay__card" style="${normalizedLayout === 'anchored' ? readAnchorStyle(anchor) : ''}">
        <button
          class="info-overlay__close"
          data-role="close-info-overlay"
          type="button"
          aria-label="关闭说明"
        >
          ×
        </button>
        <span class="scene-caption">${detail.eyebrow ?? '规则说明'}</span>
        <div class="stack" style="margin-top:0.9rem;">
          <h2 class="overlay-title">${detail.title ?? '说明'}</h2>
          ${detail.cell ? `<p class="overlay-copy"><strong>格子：</strong>第 ${detail.cell} 格</p>` : ''}
          ${detail.trigger ? `<p class="overlay-copy"><strong>触发：</strong>${detail.trigger}</p>` : ''}
          ${detail.effectText ? `<p class="overlay-copy"><strong>效果：</strong>${detail.effectText}</p>` : ''}
          ${detail.example ? `<p class="overlay-copy"><strong>例如：</strong>${detail.example}</p>` : ''}
        </div>
      </article>
    </section>
  `;

  root.querySelector('[data-role="close-info-overlay"]')?.addEventListener('click', () => {
    onClose?.();
  });
}
