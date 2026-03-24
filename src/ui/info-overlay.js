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
  const effectText = detail.effectText ?? '暂无效果说明';

  root.innerHTML = `
    <section
      data-role="info-overlay"
      class="info-overlay"
      data-layout="${normalizedLayout}"
      ${isDialogLayout ? 'role="dialog" aria-modal="true"' : ''}
    >
      <article
        data-role="info-overlay-card"
        class="info-overlay__card info-overlay__card--effect"
        style="${normalizedLayout === 'anchored' ? readAnchorStyle(anchor) : ''}"
      >
        <button
          class="info-overlay__close"
          data-role="close-info-overlay"
          type="button"
          aria-label="关闭说明"
        >
          ×
        </button>
        <p class="overlay-copy"><strong>效果：</strong>${effectText}</p>
      </article>
    </section>
  `;

  root.querySelector('[data-role="info-overlay"]')?.addEventListener('click', (event) => {
    const overlay = event.currentTarget;
    if (event.target === overlay) {
      onClose?.();
    }
  });

  root.querySelector('[data-role="close-info-overlay"]')?.addEventListener('click', () => {
    onClose?.();
  });
}
