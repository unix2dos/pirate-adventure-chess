/**
 * 根据事件 emoji 判断情绪色调
 * lucky → 金色暖光   danger → 红色危险   neutral → 蓝色海洋
 */
function getEventMood(event) {
  const emoji = event?.emoji ?? '';
  const dangerSigns = ['🦈', '🌀', '🏴‍☠️', '🐙'];
  const luckySigns  = ['⭐', '💎', '🪜', '🌈', '🎲', '🌉'];
  if (dangerSigns.some((e) => emoji.includes(e))) return 'danger';
  if (luckySigns.some((e) => emoji.includes(e)))  return 'lucky';
  return 'neutral';
}

/** 根据情绪生成背景遮罩色 */
function getMoodBackdrop(mood) {
  switch (mood) {
    case 'danger':  return 'oklch(0.22 0.14 22 / 0.72)';
    case 'lucky':   return 'oklch(0.28 0.12 70 / 0.65)';
    default:        return 'oklch(0.18 0.08 232 / 0.65)';
  }
}

/** 根据情绪生成卡片强调色 */
function getMoodAccent(mood) {
  switch (mood) {
    case 'danger':  return 'oklch(0.62 0.22 22)';
    case 'lucky':   return 'oklch(0.72 0.20 80)';
    default:        return 'oklch(0.62 0.18 228)';
  }
}

function normalizeChoices(choices = []) {
  if (Array.isArray(choices) && choices.length > 0) {
    return choices;
  }
  return [{ label: '继续航行', value: null }];
}

export function renderEventOverlay(root, { event, onResolve }) {
  const choices = normalizeChoices(event?.choices);
  const mood    = getEventMood(event);
  const backdrop = getMoodBackdrop(mood);
  const accent   = getMoodAccent(mood);

  root.innerHTML = `
    <section
      data-scene="event-overlay"
      class="event-overlay event-overlay-backdrop"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="event-title"
      aria-describedby="event-desc"
      data-mood="${mood}"
      style="background:${backdrop};"
    >
      <div aria-live="assertive" class="sr-only">
        触发海上遭遇：${event?.title ?? '神秘遭遇'}。${event?.description ?? ''}
      </div>

      <article class="overlay-card event-overlay-card" data-mood="${mood}">

        <!-- 情绪光晕 -->
        <div class="overlay-card__glow" style="--mood-color:${accent};" aria-hidden="true"></div>

        <div class="overlay-card__body stack">

          <!-- 类型标签 -->
          <span class="scene-caption event-caption" data-mood="${mood}">
            ${{ danger: '⚠️ 危险遭遇', lucky: '✨ 幸运事件', neutral: '🌊 海上遭遇' }[mood]}
          </span>

          <!-- 超大 emoji：视觉核心 -->
          <div class="overlay-badge overlay-emoji" aria-hidden="true">
            ${event?.emoji ?? '🌊'}
          </div>

          <!-- 标题 -->
          <h2 id="event-title" class="overlay-title">${event?.title ?? '神秘遭遇'}</h2>

          <!-- 描述 -->
          <p id="event-desc" class="overlay-copy">${event?.description ?? ''}</p>
        </div>

        <!-- 行动按钮 -->
        <div class="overlay-actions">
          ${choices.map((choice, index) => `
            <button
              class="action-button action-button--primary overlay-choice"
              data-index="${index}"
              data-mood="${mood}"
              type="button"
            >
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
