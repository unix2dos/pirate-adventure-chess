export function renderStartScreen(root, { onStart }) {
  let selectedCount = 2;
  let useAI = true;
  const countOptions = [2, 3, 4];

  root.innerHTML = `
    <section data-scene="start" class="scene-shell start-scene">
      <div class="scene-grid start-grid">
        <div class="start-hero stack">
          <span class="hero-badge">本地同屏 · 亲子冒险</span>
          <h1 class="display-title">彩浪海盗寻宝赛</h1>
          <p class="support-copy">带着一群小船长穿过会冒泡的海域，谁先冲上闪光宝岛，谁就抱走今天的宝藏箱。</p>
          <div class="sticker-row">
            <span class="sticker">🌈 彩虹航线</span>
            <span class="sticker">🎉 海上惊喜</span>
            <span class="sticker">🏆 冲线庆祝</span>
          </div>
          <div class="map-showcase" aria-hidden="true">
            <span class="map-showcase__sun"></span>
            <span class="map-showcase__island map-showcase__island--one"></span>
            <span class="map-showcase__island map-showcase__island--two"></span>
            <div class="map-showcase__path">
              <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6 16C22 5 31 27 44 22C56 18 56 42 71 34C82 28 88 18 94 12"
                  stroke="rgba(255,255,255,0.92)"
                  stroke-width="6"
                  stroke-linecap="round"
                />
                <path
                  d="M6 16C22 5 31 27 44 22C56 18 56 42 71 34C82 28 88 18 94 12"
                  stroke="rgba(255,124,89,0.92)"
                  stroke-width="2.6"
                  stroke-linecap="round"
                  stroke-dasharray="4 5"
                />
              </svg>
            </div>
            <span class="map-showcase__token map-showcase__token--a">⚓ 出发</span>
            <span class="map-showcase__token map-showcase__token--b">⭐ 许愿星</span>
            <span class="map-showcase__token map-showcase__token--c">🏆 终点</span>
          </div>
        </div>
        <article class="scene-panel start-panel stack">
          <span class="scene-caption">准备起航</span>
          <h2 class="panel-title">先把今天的船队叫上船</h2>
          <div class="count-picker" data-role="count-picker">
            ${countOptions.map((count) => `
              <button
                class="count-option"
                data-count="${count}"
                data-active="${count === selectedCount}"
                aria-pressed="${count === selectedCount}"
                type="button"
              >
                ${count} 人
              </button>
            `).join('')}
          </div>
          <label class="stack">
            <span class="field-label">给 1 号船长起个名字</span>
            <input id="player-name-0" class="name-field" value="你" maxlength="12" />
          </label>
          <label class="toggle-row">
            <input id="use-ai" type="checkbox" checked />
            <span>其他船员交给 AI 掌舵，轮到他们也能自己走。</span>
          </label>
          <div class="stack">
            <span class="field-label">出航名单</span>
            <div class="crew-preview" data-role="crew-preview"></div>
          </div>
          <button class="action-button action-button--primary" data-role="start-adventure" type="button">开始冒险</button>
          <p class="helper-text">同屏轮流玩，一局很快，孩子不需要先看一整页规则。</p>
        </article>
      </div>
    </section>
  `;

  const nameInput = root.querySelector('#player-name-0');
  const useAICheckbox = root.querySelector('#use-ai');
  const previewRoot = root.querySelector('[data-role="crew-preview"]');

  function syncCountButtons() {
    root.querySelectorAll('[data-count]').forEach((button) => {
      const active = Number(button.dataset.count) === selectedCount;
      button.dataset.active = String(active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function renderPreview() {
    previewRoot.innerHTML = Array.from({ length: selectedCount }, (_, index) => {
      const isAIPlayer = index > 0 && useAI;
      const name = index === 0 ? (nameInput.value || '你') : `海盗${index}`;
      return `
        <span class="preview-pill" data-ai="${isAIPlayer}">
          ${isAIPlayer ? '🤖' : '🧭'} ${name}
        </span>
      `;
    }).join('');
  }

  syncCountButtons();
  renderPreview();

  nameInput.addEventListener('input', () => {
    renderPreview();
  });

  useAICheckbox.addEventListener('change', () => {
    useAI = useAICheckbox.checked;
    renderPreview();
  });

  root.querySelectorAll('[data-count]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedCount = Number(button.dataset.count) || 2;
      syncCountButtons();
      renderPreview();
    });
  });

  root.querySelector('[data-role="start-adventure"]').addEventListener('click', () => {
    const captainName = nameInput.value || '你';
    onStart({
      players: Array.from({ length: selectedCount }, (_, index) => ({
        name: index === 0 ? captainName : `海盗${index}`,
        isAI: index > 0 && useAI,
      })),
    });
  });
}
