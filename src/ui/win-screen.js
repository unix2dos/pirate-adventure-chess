export function renderWinScreen(root, { winner, ranking = [], onReplay }) {
  root.innerHTML = `
    <section data-scene="win" style="min-height:100vh;display:grid;place-items:center;padding:24px;box-sizing:border-box;background:linear-gradient(180deg,#8dd8ff 0%,#fff7cf 100%);">
      <article style="width:min(560px,100%);background:#fffaf0;border-radius:28px;padding:28px;box-shadow:0 24px 48px rgba(13,31,67,0.18);text-align:center;">
        <div style="font-size:56px;">🏆</div>
        <p style="margin:0;color:#ff7b4a;font-weight:700;">宝藏争夺结果</p>
        <h1 style="margin:8px 0 12px;font-size:clamp(2rem,5vw,3rem);color:#17325c;">${winner?.name ?? '小船长'} 找到宝藏啦！</h1>
        <p style="margin:0 0 20px;color:#52627d;">船队穿过糖果海湾，终于第一个登上了闪光宝岛。</p>
        <ol style="margin:0;padding:0;list-style:none;display:grid;gap:10px;">
          ${ranking.map((player, index) => `
            <li style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:${index === 0 ? '#fff0c8' : '#eef6ff'};border-radius:18px;">
              <span style="display:flex;align-items:center;gap:10px;color:#17325c;font-weight:700;">
                <span style="width:32px;height:32px;border-radius:999px;background:${player.color ?? '#7a9cff'};display:inline-grid;place-items:center;color:#fff;">${index + 1}</span>
                ${player.name}
              </span>
              <span style="color:#52627d;">航行到 ${player.position} 格</span>
            </li>
          `).join('')}
        </ol>
        <button data-role="replay" type="button" style="margin-top:22px;border:none;border-radius:999px;padding:14px 24px;background:#ff7b4a;color:#fff;font-size:1rem;font-weight:800;cursor:pointer;">
          再玩一局
        </button>
      </article>
    </section>
  `;

  root.querySelector('[data-role="replay"]').addEventListener('click', () => {
    if (typeof onReplay === 'function') {
      onReplay();
    }
  });
}
