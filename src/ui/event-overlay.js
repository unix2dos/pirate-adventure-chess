function normalizeChoices(choices = []) {
  if (Array.isArray(choices) && choices.length > 0) {
    return choices;
  }

  return [{ label: '继续航行', value: null }];
}

export function renderEventOverlay(root, { event, onResolve }) {
  const choices = normalizeChoices(event?.choices);

  root.innerHTML = `
    <section data-scene="event-overlay" style="position:absolute;inset:0;background:#0f2248b8;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;">
      <article style="width:min(460px,100%);background:#fff9ef;border-radius:18px;padding:18px;box-shadow:0 16px 30px #0d1f43;">
        <div style="font-size:40px;text-align:center;">${event?.emoji ?? '🌊'}</div>
        <h2 style="margin:8px 0 6px;text-align:center;">${event?.title ?? '神秘遭遇'}</h2>
        <p style="margin:0 0 14px;text-align:center;color:#3f4f6d;">${event?.description ?? ''}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
          ${choices.map((choice, index) => `
            <button data-index="${index}" type="button" style="border:none;border-radius:12px;padding:10px 14px;background:#ff7b4a;color:#fff;font-weight:700;cursor:pointer;">
              ${choice.label}
            </button>
          `).join('')}
        </div>
      </article>
    </section>
  `;

  root.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      const choice = choices[Number(button.dataset.index)];
      onResolve(choice?.value);
    });
  });
}
