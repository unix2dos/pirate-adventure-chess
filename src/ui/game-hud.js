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
    <aside data-scene="game-hud" class="hud-float">
      <div class="hud-turn-pill" data-role="turn-pill" style="--current-player:${currentPlayer.color};">
        <span class="hud-turn-pill__badge">${currentPlayerNumber}</span>
        <span class="hud-turn-pill__copy">第 ${state.turnNumber ?? 1} 回合 · ${currentPlayer.name}</span>
      </div>

      <details class="hud-drawer" data-role="hud-drawer">
        <summary class="hud-drawer__toggle" data-role="hud-toggle">
          航海卡
        </summary>
        <div class="hud-drawer__sheet">
          <section data-role="current-player-banner" class="hud-drawer__panel hud-drawer__panel--turn" style="--current-player:${currentPlayer.color};">
            <p class="hud-mini__eyebrow">${turnLabel}</p>
            <div class="hud-mini__current">
              <span class="hud-mini__current-badge">${currentPlayerNumber}</span>
              <div class="hud-mini__current-copy">
                <strong>${currentPlayer.name}</strong>
                <span>第 ${currentPlayer.position ?? 1} 格</span>
              </div>
            </div>
          </section>

          <section data-role="player-legend" class="hud-drawer__panel hud-drawer__panel--legend">
            <p class="hud-mini__eyebrow">玩家</p>
            <ul class="hud-legend">
              ${renderLegendItems(crew, currentPlayer.id)}
            </ul>
          </section>

          <section class="hud-drawer__panel hud-drawer__panel--event">
            <p class="hud-mini__eyebrow">最近</p>
            <p class="hud-mini__event" data-role="event-note">
              <span class="hud-mini__event-text">${recentEventTitle}</span>
            </p>
          </section>

          <section class="hud-drawer__panel hud-drawer__panel--hint">
            <p class="hud-mini__eyebrow">提示</p>
            <p class="hud-drawer__hint">${actionTitle}</p>
          </section>
        </div>
      </details>

      <section data-role="action-dock" class="hud-float__dock">
        <button class="action-button action-button--primary dice-fab" data-role="roll-action" type="button">
          <span class="dice-fab__icon">🎲</span>
          <span class="dice-fab__label">${state.gameOver ? '终点' : '掷骰'}</span>
        </button>
      </section>
    </aside>
  `;
}
