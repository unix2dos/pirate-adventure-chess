function renderLegendItems(crew, currentPlayerId) {
  return crew
    .map((member, index) => {
      const active = member.id === currentPlayerId;
      return `
        <li class="hud-legend__item" data-active="${active}" style="--crew-color:${member.color ?? '#ff6b6b'};">
          <span class="hud-legend__left">
            <span class="hud-legend__badge">${index + 1}</span>
            <span class="hud-legend__name">${member.name}</span>
          </span>
          <span class="hud-legend__meta">${member.position ?? 1}</span>
        </li>
      `;
    })
    .join('');
}

export function renderGameHud(root, { state }) {
  const currentPlayer = state.currentPlayer ?? { id: 'crew-1', name: '待命船员', color: '#ff6b6b' };
  const crew = Array.isArray(state.crew) && state.crew.length > 0 ? state.crew : [currentPlayer];
  const recentEventTitle = state.recentEvent?.title ?? '准备出航';
  const turnLabel = typeof state.turnNumber === 'number' ? `第 ${state.turnNumber} 回合` : '冒险进行中';
  const currentPlayerNumber = Math.max(1, crew.findIndex(({ id }) => id === currentPlayer.id) + 1);
  const actionTitle = state.pendingEvent
    ? '先处理这次遭遇，再继续出航'
    : state.gameOver
      ? '宝藏已经找到，准备庆祝'
      : '掷骰出航，看看下一站会撞见什么';

  root.innerHTML = `
    <aside data-scene="game-hud" class="hud-mini">
      <section data-role="current-player-banner" class="hud-mini__section hud-mini__section--turn" style="--current-player:${currentPlayer.color};">
        <p class="hud-mini__eyebrow">${turnLabel}</p>
        <div class="hud-mini__current">
          <span class="hud-mini__current-badge">${currentPlayerNumber}</span>
          <div class="hud-mini__current-copy">
            <strong>${currentPlayer.name}</strong>
            <span>第 ${currentPlayer.position ?? 1} 格</span>
          </div>
        </div>
      </section>

      <section data-role="player-legend" class="hud-mini__section hud-mini__section--legend">
        <p class="hud-mini__eyebrow">玩家</p>
        <ul class="hud-legend">
          ${renderLegendItems(crew, currentPlayer.id)}
        </ul>
      </section>

      <p class="hud-mini__event" data-role="event-note">
        <span class="hud-mini__event-label">最近</span>
        <span class="hud-mini__event-text">${recentEventTitle}</span>
      </p>

      <section data-role="action-dock" class="hud-mini__section hud-mini__section--action">
        <p class="hud-mini__eyebrow">动作</p>
        <p class="hud-mini__action-copy">${actionTitle}</p>
        <button class="action-button action-button--primary roll-button roll-button--compact" data-role="roll-action" type="button">
          ${state.gameOver ? '宝藏到手' : '掷骰出航'}
        </button>
      </section>
    </aside>
  `;
}
