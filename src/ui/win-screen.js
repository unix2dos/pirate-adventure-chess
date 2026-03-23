export function renderWinScreen(root, { winner, ranking = [], onReplay }) {
  root.innerHTML = `
    <section data-scene="win" class="scene-shell win-scene">
      <div class="scene-grid win-grid">
        <div class="win-hero stack">
          <span class="hero-badge">庆祝时刻 · Treasure Found</span>
          <h1 class="display-title">${winner?.name ?? '小船长'} 找到宝藏啦！</h1>
          <p class="support-copy">船队穿过糖果海湾、泡泡海峡和章鱼湾，终于第一个冲上闪光宝岛。现在可以再来一局，换个人当船长。</p>
          <div class="confetti-strip" aria-hidden="true">
            <span class="confetti-dot" style="--dot-color:var(--coral);"></span>
            <span class="confetti-dot" style="--dot-color:var(--lemon);"></span>
            <span class="confetti-dot" style="--dot-color:var(--mint);"></span>
            <span class="confetti-dot" style="--dot-color:#69c4ff;"></span>
            <span class="confetti-dot" style="--dot-color:#ff98bb;"></span>
          </div>
        </div>
        <article class="scene-panel win-panel stack">
          <span class="scene-caption">宝藏争夺结果</span>
          <h2 class="panel-title">谁先冲上了终点岛？</h2>
          <ol class="ranking-list">
          ${ranking.map((player, index) => `
            <li class="ranking-item ${index === 0 ? 'ranking-item--winner' : ''}" style="--crew-color:${player.color ?? '#7a9cff'};">
              <span class="ranking-item__left">
                <span class="ranking-item__badge">${index + 1}</span>
                <span class="ranking-item__name">${player.name}</span>
              </span>
              <span class="ranking-item__meta">航行到 ${player.position} 格</span>
            </li>
          `).join('')}
          </ol>
          <button class="action-button action-button--primary" data-role="replay" type="button">再玩一局</button>
          <p class="helper-text">重开后会回到开局页，你可以换人数、换名字，或者把其他船员改成 AI。</p>
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
