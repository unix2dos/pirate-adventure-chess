import { getPlayerBadgeText } from '../core/players.js';

function buildRecentRollSummary(recentRolls = []) {
  if (!Array.isArray(recentRolls) || recentRolls.length === 0) {
    return '最近还没有掷骰结果';
  }

  return recentRolls
    .slice(0, 2)
    .map((entry) => `${entry.playerName ?? '船长'} ${Number(entry.roll) || 0} 点`)
    .join('，');
}

export function renderGameHud(root, { state, layout = { mode: 'desktop' } }) {
  const currentPlayer = state.currentPlayer ?? { id: 'crew-1', name: '待命船员', color: '#ff6b6b' };
  const crew = Array.isArray(state.crew) && state.crew.length > 0 ? state.crew : [currentPlayer];
  const layoutMode = layout?.mode ?? 'desktop';
  const hudDensity = layoutMode === 'mobile-portrait' ? 'compact' : 'default';
  const recentEventTitle = state.recentEvent?.title ?? '准备出航';
  const recentRolls = Array.isArray(state.recentRolls) ? state.recentRolls : [];
  const turnLabel = typeof state.turnNumber === 'number' ? `回合 ${state.turnNumber}` : '冒险进行中';
  const bgmMuted = Boolean(state.bgmMuted);
  const sfxMuted = Boolean(state.sfxMuted);
  const currentPlayerNumber = Math.max(1, crew.findIndex(({ id }) => id === currentPlayer.id) + 1);
  const currentPlayerBadge = getPlayerBadgeText(currentPlayer.name, currentPlayerNumber);
  const motionPhase = state.animation?.phase ?? 'idle';
  const diceValue = Number.isFinite(state.animation?.diceValue) ? state.animation.diceValue : null;
  const rollSummaryLabel = buildRecentRollSummary(recentRolls);
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
  const statusTags = Array.isArray(state.currentPlayerStatus)
    ? state.currentPlayerStatus
    : [];
  const statusLabel = statusTags.length > 0 ? statusTags.join(' / ') : '正常';

  root.innerHTML = `
    <div aria-live="polite" class="sr-only">
      最近掷骰：${rollSummaryLabel}。轮到 ${currentPlayer.name}。${turnLabel}。状态 ${statusLabel}。${actionTitle}。${recentEventTitle}
    </div>
    <aside data-scene="game-hud" class="hud-float" data-layout="${layoutMode}" data-density="${hudDensity}">
      <div class="hud-primary-bar" data-role="hud-primary-bar" data-attach="top">
        <details class="hud-drawer" data-role="hud-drawer">
          <summary class="hud-drawer__toggle" data-role="hud-toggle">
            设置
          </summary>
          <div class="hud-drawer__sheet">
            <section class="hud-drawer__panel hud-drawer__panel--settings">
              <p class="hud-mini__eyebrow">设置</p>
              <div class="hud-settings">
                <button
                  class="action-button action-button--secondary sound-toggle"
                  data-role="bgm-toggle"
                  aria-label="切换背景音"
                  aria-pressed="${bgmMuted ? 'true' : 'false'}"
                  type="button"
                >
                  <span class="sound-toggle__icon">${bgmMuted ? '🎵' : '🔊'}</span>
                  <span class="sound-toggle__text">背景音 ${bgmMuted ? '关' : '开'}</span>
                </button>
                <button
                  class="action-button action-button--secondary sound-toggle"
                  data-role="sfx-toggle"
                  aria-label="切换音效"
                  aria-pressed="${sfxMuted ? 'true' : 'false'}"
                  type="button"
                >
                  <span class="sound-toggle__icon">${sfxMuted ? '🎯' : '🔔'}</span>
                  <span class="sound-toggle__text">音效 ${sfxMuted ? '关' : '开'}</span>
                </button>
              </div>
            </section>
          </div>
        </details>

        <section data-role="action-dock" class="hud-float__dock">
          <div class="hud-turn-status-bar" data-role="turn-status-bar" style="--current-player:${currentPlayer.color};">
            <span class="hud-turn-status-bar__avatar">${currentPlayerBadge}</span>
            <span class="hud-turn-status-bar__text">
              <strong>${currentPlayer.name}</strong>
              <span>${turnLabel} · ${statusLabel}</span>
            </span>
          </div>
          <button class="action-button action-button--primary dice-fab" data-role="roll-action" data-motion="${motionPhase}" type="button">
            <span class="dice-fab__icon">🎲</span>
            <span class="dice-fab__label">${actionLabel}</span>
            ${diceValue ? `<span class="dice-fab__value">${diceValue}</span>` : ''}
          </button>
        </section>
      </div>
    </aside>
  `;
}
