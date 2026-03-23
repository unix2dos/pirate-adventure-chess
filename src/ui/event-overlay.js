function normalizeChoices(choices = []) {
  if (Array.isArray(choices) && choices.length > 0) {
    return choices;
  }

  return [{ label: '继续航行', value: null }];
}

export function renderEventOverlay(root, { event, onResolve }) {
  const choices = normalizeChoices(event?.choices);

  root.innerHTML = `
    <section data-scene="event-overlay" class="event-overlay" role="alertdialog" aria-modal="true" aria-labelledby="event-title" aria-describedby="event-desc">
      <div aria-live="assertive" class="sr-only">触发海上遭遇：${event?.title ?? '神秘遭遇'}。${event?.description ?? ''}</div>
      <article class="overlay-card">
        <span class="scene-caption">海上遭遇</span>
        <div class="stack" style="margin-top:1rem;">
          <div class="overlay-badge" aria-hidden="true">${event?.emoji ?? '🌊'}</div>
          <h2 id="event-title" class="overlay-title">${event?.title ?? '神秘遭遇'}</h2>
          <p id="event-desc" class="overlay-copy">${event?.description ?? ''}</p>
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

  const firstButton = root.querySelector('button');
  if (firstButton) {
    requestAnimationFrame(() => firstButton.focus());
  }
}
