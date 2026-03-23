function normalizeChoices(choices = []) {
  if (Array.isArray(choices) && choices.length > 0) {
    return choices;
  }

  return [{ label: '继续航行', value: null }];
}

export function renderEventOverlay(root, { event, onResolve }) {
  const choices = normalizeChoices(event?.choices);

  root.innerHTML = `
    <section data-scene="event-overlay" class="event-overlay">
      <article class="overlay-card">
        <span class="scene-caption">海上遭遇</span>
        <div class="stack" style="margin-top:1rem;">
          <div class="overlay-badge">${event?.emoji ?? '🌊'}</div>
          <h2 class="overlay-title">${event?.title ?? '神秘遭遇'}</h2>
          <p class="overlay-copy">${event?.description ?? ''}</p>
        </div>
        <div class="overlay-actions">
          ${choices.map((choice, index) => `
            <button class="action-button action-button--primary overlay-choice" data-index="${index}" type="button">
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
