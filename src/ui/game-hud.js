function renderCrewItems(crew, currentPlayerId) {
  return crew
    .map((member, index) => {
      const active = member.id === currentPlayerId;
      return `
        <li class="crew-pill" data-active="${active}" style="--crew-color:${member.color ?? '#ff6b6b'};">
          <span class="ranking-item__left">
            <span class="ranking-item__badge">${index + 1}</span>
            <span class="crew-pill__name">${member.name}</span>
          </span>
          <span class="crew-pill__meta">第 ${member.position ?? 1} 格</span>
        </li>
      `;
    })
    .join('');
}

export function renderGameHud(root, { state }) {
  const currentPlayer = state.currentPlayer ?? { id: 'crew-1', name: '待命船员', color: '#ff6b6b' };
  const crew = Array.isArray(state.crew) && state.crew.length > 0 ? state.crew : [currentPlayer];
  const recentEventTitle = state.recentEvent?.title ?? '准备出航';
  const zoneLabel = state.currentZoneLabel ?? '晴空湾';
  const objective = state.currentObjective ?? `穿越${zoneLabel}`;
  const turnLabel = typeof state.turnNumber === 'number' ? `第 ${state.turnNumber} 回合` : '冒险进行中';
  const actionTitle = state.pendingEvent
    ? '先处理这次遭遇，再继续出航'
    : state.gameOver
      ? '宝藏已经找到，准备庆祝'
      : '掷骰出航，看看下一站会撞见什么';

  root.innerHTML = `
    <aside data-scene="game-hud" class="hud-stack">
      <section data-role="current-player-banner" class="hud-banner" style="--current-player:${currentPlayer.color};">
        <p class="hud-banner__eyebrow">${turnLabel}</p>
        <div class="hud-banner__title">
          <span class="crew-dot" style="--crew-color:${currentPlayer.color};"></span>
          <span>${currentPlayer.name}</span>
        </div>
        <p class="hud-copy">轮到这位小船长掌舵，目标是穿过 ${zoneLabel}。</p>
      </section>
      <section data-role="zone-objective-card" class="hud-card hud-card--objective">
        <p class="hud-card__eyebrow">当前海域目标</p>
        <h3 class="hud-card__title">${zoneLabel}</h3>
        <p class="hud-copy">${objective}</p>
      </section>
      <section data-role="recent-encounter-card" class="hud-card hud-card--encounter">
        <p class="hud-card__eyebrow">最近遭遇</p>
        <h3 class="hud-card__title">${recentEventTitle}</h3>
        <p class="hud-copy">把日志缩成一句话，只保留真正能推动下一步的信息。</p>
      </section>
      <section data-role="crew-strip" class="hud-card hud-card--crew">
        <p class="hud-card__eyebrow">船员队列</p>
        <ul class="crew-list">
          ${renderCrewItems(crew, currentPlayer.id)}
        </ul>
      </section>
      <section data-role="action-dock" class="action-dock">
        <p class="action-dock__eyebrow">下一步</p>
        <h3 class="action-dock__title">${actionTitle}</h3>
        <p class="hud-copy">${state.pendingEvent ? '解决完这次遭遇，回合才会继续往下走。' : '每次落点都有可能触发新的海域事件。'}</p>
        <button class="action-button action-button--primary roll-button" data-role="roll-action" type="button">
          ${state.gameOver ? '宝藏到手' : '掷骰出航'}
        </button>
      </section>
    </aside>
  `;
}
