/** 生成 CSS 彩带粒子 HTML */
function buildConfetti(count = 72) {
  const colors   = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6ef7', '#ff9f43', '#00d2d3', '#54a0ff'];
  const shapes   = ['50%', '2px', '4px', '0']; // circle, tall rect, wide rect, square
  return Array.from({ length: count }, (_, i) => {
    const color = colors[i % colors.length];
    const br    = shapes[i % shapes.length];
    const x     = (Math.random() * 100).toFixed(1);
    const delay = (Math.random() * 2.4).toFixed(2);
    const dur   = (2.6 + Math.random() * 2).toFixed(2);
    const size  = (8 + Math.random() * 12).toFixed(1);
    const rot   = (Math.random() * 360).toFixed(0);
    const sway  = (10 + Math.random() * 30).toFixed(0);
    return `<span class="confetti-particle" style="--x:${x}%;--delay:${delay}s;--dur:${dur}s;--color:${color};--size:${size}px;--br:${br};--rot:${rot}deg;--sway:${sway}px;" aria-hidden="true"></span>`;
  }).join('');
}

export function renderWinScreen(root, { winner, ranking = [], onReplay }) {
  root.innerHTML = `
    <!-- 彩带粒子层（fixed，覆盖全屏） -->
    <div class="confetti-canvas" aria-hidden="true">
      ${buildConfetti(80)}
    </div>

    <section data-scene="win" class="scene-shell win-scene">
      <div class="scene-grid win-grid">

        <!-- ══ 英雄区 ══ -->
        <div class="win-hero stack">
          <span class="hero-badge">🎉 宝藏已经找到！</span>

          <!-- 冠军大头像 -->
          <div class="winner-announce">
            <div class="winner-trophy" aria-hidden="true">🏆</div>
            <h1 class="display-title">
              ${winner?.name ?? '小船长'}<br>找到宝藏啦！
            </h1>
          </div>

          <p class="support-copy">
            船队穿过糖果海湾、泡泡海峡和章鱼湾，终于第一个冲上闪光宝岛。
            可以再来一局，换个人当船长！
          </p>

          <!-- 金色彩条装饰 -->
          <div class="win-ribbon-row" aria-hidden="true">
            <span class="win-ribbon" style="--rb:#ff6b6b;--delay:0.0s"></span>
            <span class="win-ribbon" style="--rb:#ffd93d;--delay:0.1s"></span>
            <span class="win-ribbon" style="--rb:#6bcb77;--delay:0.2s"></span>
            <span class="win-ribbon" style="--rb:#4d96ff;--delay:0.3s"></span>
            <span class="win-ribbon" style="--rb:#ff6ef7;--delay:0.4s"></span>
            <span class="win-ribbon" style="--rb:#ff9f43;--delay:0.5s"></span>
            <span class="win-ribbon" style="--rb:#00d2d3;--delay:0.6s"></span>
          </div>
        </div>

        <!-- ══ 排行面板 ══ -->
        <article class="scene-panel win-panel stack">
          <span class="scene-caption">🗺️ 宝藏争夺结果</span>
          <h2 class="panel-title">谁先冲上了终点岛？</h2>

          <ol class="ranking-list">
          ${ranking.map((player, index) => `
            <li
              class="ranking-item ${index === 0 ? 'ranking-item--winner' : ''}"
              style="--crew-color:${player.color ?? '#7a9cff'};"
            >
              <span class="ranking-item__left">
                <span class="ranking-item__badge">
                  ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </span>
                <span class="ranking-item__name">${player.name}</span>
                ${index === 0 ? '<span class="winner-crown" aria-hidden="true">👑</span>' : ''}
              </span>
              <span class="ranking-item__meta">抵达第 ${player.position} 格</span>
            </li>
          `).join('')}
          </ol>

          <button class="action-button action-button--primary replay-btn" data-role="replay" type="button">
            <span>⛵ 再玩一局</span>
          </button>
          <p class="helper-text">重开后可以换人数、换名字，或者把其他船员改成 AI。</p>
        </article>
      </div>
    </section>
  `;

  root.querySelector('[data-role="replay"]').addEventListener('click', () => {
    if (typeof onReplay === 'function') {
      onReplay();
    }
  });
}
