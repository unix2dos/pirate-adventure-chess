import { getPlayerBadgeText } from '../core/players.js';

function renderLegendItems(crew, currentPlayerId) {
  return crew
    .map((member, index) => {
      const active = member.id === currentPlayerId;
      const badgeText = getPlayerBadgeText(member.name, index + 1);
      return `
        <li class="hud-legend__item" data-active="${active}" style="--crew-color:${member.color ?? '#ff6b6b'};">
          <span class="hud-legend__left">
            <span class="hud-legend__badge">${badgeText}</span>
            <span class="hud-legend__name">${member.name}</span>
          </span>
          <span class="hud-legend__meta">第 ${member.position ?? 1} 格</span>
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
  const soundLabel = state.soundMuted ? '静音中' : '声音开';
  const currentPlayerNumber = Math.max(1, crew.findIndex(({ id }) => id === currentPlayer.id) + 1);
  const currentPlayerBadge = getPlayerBadgeText(currentPlayer.name, currentPlayerNumber);
  const motionPhase = state.animation?.phase ?? 'idle';
  const diceValue = Number.isFinite(state.animation?.diceValue) ? state.animation.diceValue : null;
  const actionTitle = state.pendingEvent
    ? '先处理这次遭遇，再继续出航'
    : state.gameOver
      ? '宝藏已经找到，准备庆祝'
      : motionPhase === 'rolling'
        ? '骰子正在翻滚，马上就知道会走几步'
        : motionPhase === 'moving'
          ? '小船长正在一格一格往前冲'
          : motionPhase === 'landing'
            ? '马上要停下来了，看看踩中了什么'
      : '掷骰出航，看看下一站会撞见什么';
  const actionLabel = state.gameOver
    ? '终点'
    : motionPhase === 'rolling'
      ? '摇骰中'
      : motionPhase === 'moving'
        ? '航行中'
        : motionPhase === 'landing'
          ? '快到了'
          : motionPhase === 'result'
            ? '本回合'
            : '掷骰';

  root.innerHTML = `
    <div aria-live="polite" class="sr-only">
      ${turnLabel}。${currentPlayer.name}。${actionTitle}。${recentEventTitle}
    </div>
    <aside data-scene="game-hud" class="hud-float">
      <div class="hud-turn-pill" data-role="turn-pill" style="--current-player:${currentPlayer.color};">
        <span class="hud-turn-pill__avatar">${currentPlayerBadge}</span>
        <span class="hud-turn-pill__stack">
          <span class="hud-turn-pill__eyebrow">${turnLabel}</span>
          <strong class="hud-turn-pill__name">${currentPlayer.name}</strong>
        </span>
      </div>

      <details class="hud-drawer" data-role="hud-drawer">
        <summary class="hud-drawer__toggle" data-role="hud-toggle">
          航海卡
        </summary>
        <div class="hud-drawer__sheet">
          <section data-role="current-player-banner" class="hud-drawer__panel hud-drawer__panel--turn" style="--current-player:${currentPlayer.color};">
            <div class="hud-mini__bar">
              <p class="hud-mini__eyebrow">${turnLabel}</p>
              <button
                class="action-button action-button--secondary sound-toggle sound-toggle--inline"
                data-role="sound-toggle"
                aria-label="切换声音"
                aria-pressed="${state.soundMuted ? 'true' : 'false'}"
                type="button"
              >
                <span class="sound-toggle__icon">${state.soundMuted ? '🔇' : '🔊'}</span>
                <span class="sound-toggle__text">${soundLabel}</span>
              </button>
            </div>
            <div class="hud-mini__current">
              <span class="hud-mini__current-badge">${currentPlayerBadge}</span>
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
        <button class="action-button action-button--primary dice-fab" data-role="roll-action" data-motion="${motionPhase}" type="button">
          <span class="dice-fab__icon">🎲</span>
          <span class="dice-fab__label">${actionLabel}</span>
          ${diceValue ? `<span class="dice-fab__value">${diceValue}</span>` : ''}
        </button>
      </section>
    </aside>
  `;
}
