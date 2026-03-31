export function renderStartScreen(root, { onStart }) {
  let selectedMode = 'solo-ai';

  root.innerHTML = `
    <section data-scene="start" class="scene-shell start-scene">
      <div class="scene-grid start-grid">

        <!-- ══ 英雄区：动态海洋场景 ══ -->
        <div class="start-hero stack">
          <span class="hero-badge">本地同屏 · 亲子冒险</span>
          <h1 class="display-title">彩浪海盗<br>寻宝赛</h1>
          <p class="support-copy">带着一群小船长穿过会冒泡的海域，谁先冲上闪光宝岛，谁就抱走今天的宝藏箱！</p>

          <div class="sticker-row">
            <span class="sticker sticker--rainbow">🌈 彩虹航线</span>
            <span class="sticker sticker--surprise">🎉 海上惊喜</span>
            <span class="sticker sticker--trophy">🏆 冲线庆祝</span>
          </div>

          <!-- 动态海洋英雄场景 -->
          <div class="hero-scene" aria-hidden="true">

            <!-- 天空层 -->
            <div class="hero-sky">
              <span class="hero-star" style="--x:8%;--y:10%;--delay:0s;--sz:6px"></span>
              <span class="hero-star" style="--x:22%;--y:6%;--delay:0.8s;--sz:4px"></span>
              <span class="hero-star" style="--x:55%;--y:8%;--delay:1.4s;--sz:5px"></span>
              <span class="hero-star" style="--x:72%;--y:5%;--delay:0.3s;--sz:7px"></span>
              <span class="hero-star" style="--x:88%;--y:12%;--delay:1.1s;--sz:4px"></span>
              <span class="hero-star" style="--x:38%;--y:14%;--delay:0.6s;--sz:3px"></span>
              <!-- 月亮 / 太阳 -->
              <div class="hero-sun"></div>
            </div>

            <!-- 波浪层（三层速差） -->
            <div class="hero-ocean">
              <div class="hero-wave hero-wave--back"  style="--wave-dur:14s"></div>
              <div class="hero-wave hero-wave--mid"   style="--wave-dur:10s"></div>
              <div class="hero-wave hero-wave--front" style="--wave-dur:7s"></div>
            </div>

            <!-- 海盗船 SVG -->
            <div class="hero-ship-wrap">
              <svg class="hero-ship" viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- 船体阴影 -->
                <ellipse cx="140" cy="156" rx="90" ry="10" fill="rgba(20,60,100,0.22)"/>
                <!-- 船舵 -->
                <circle cx="218" cy="108" r="14" stroke="#6b3a10" stroke-width="3" fill="none"/>
                <line x1="218" y1="94"  x2="218" y2="122" stroke="#6b3a10" stroke-width="2.5" stroke-linecap="round"/>
                <line x1="204" y1="108" x2="232" y2="108" stroke="#6b3a10" stroke-width="2.5" stroke-linecap="round"/>
                <circle cx="218" cy="108" r="4" fill="#8b5120"/>
                <!-- 船舷 -->
                <path d="M40 112 Q140 128 240 112 L228 148 Q140 162 52 148 Z" fill="#7a4220" stroke="#4a2010" stroke-width="2.5" stroke-linejoin="round"/>
                <!-- 船舷高光 -->
                <path d="M48 120 Q140 133 232 120" stroke="rgba(255,200,140,0.35)" stroke-width="3" stroke-linecap="round"/>
                <!-- 船身装饰条 -->
                <path d="M52 136 Q140 148 228 136" stroke="#b86030" stroke-width="5" stroke-linecap="round"/>
                <!-- 主桅杆 -->
                <line x1="132" y1="22" x2="132" y2="114" stroke="#5c3317" stroke-width="6" stroke-linecap="round"/>
                <!-- 横杆 -->
                <line x1="96"  y1="46" x2="170" y2="46" stroke="#5c3317" stroke-width="3.5" stroke-linecap="round"/>
                <!-- 主帆（左） -->
                <path d="M130 24 Q98 50 100 100 L130 100 Z" fill="rgba(255,246,222,0.94)" stroke="#b89050" stroke-width="1.8"/>
                <!-- 主帆（右） -->
                <path d="M134 24 Q166 50 164 100 L134 100 Z" fill="rgba(255,246,222,0.90)" stroke="#b89050" stroke-width="1.8"/>
                <!-- 主帆横纹 -->
                <line x1="104" y1="65" x2="130" y2="65" stroke="rgba(180,140,60,0.4)" stroke-width="1.5"/>
                <line x1="134" y1="65" x2="160" y2="65" stroke="rgba(180,140,60,0.4)" stroke-width="1.5"/>
                <!-- 前桅 -->
                <line x1="78"  y1="48" x2="78"  y2="112" stroke="#5c3317" stroke-width="4" stroke-linecap="round"/>
                <!-- 斜桅 -->
                <line x1="78"  y1="58" x2="40"  y2="80"  stroke="#5c3317" stroke-width="2.5" stroke-linecap="round"/>
                <!-- 三角帆 -->
                <path d="M78 50 L42 82 L78 106 Z" fill="rgba(255,238,200,0.88)" stroke="#b89050" stroke-width="1.5"/>
                <!-- 海盗旗绳 -->
                <line x1="132" y1="22" x2="152" y2="16" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>
                <!-- 海盗旗 -->
                <g class="hero-pirate-flag" style="transform-origin:132px 22px">
                  <rect x="152" y="10" width="30" height="22" rx="2" fill="#1a1a2a" stroke="#111" stroke-width="1"/>
                  <circle cx="164" cy="18" r="5" fill="rgba(255,255,255,0.9)"/>
                  <line x1="158" y1="24" x2="162" y2="28" stroke="rgba(255,255,255,0.8)" stroke-width="1.5" stroke-linecap="round"/>
                  <line x1="170" y1="24" x2="166" y2="28" stroke="rgba(255,255,255,0.8)" stroke-width="1.5" stroke-linecap="round"/>
                </g>
                <!-- 窗口 -->
                <circle cx="88"  cy="132" r="8"  fill="#ffdb80" stroke="#7a4220" stroke-width="2" opacity="0.9"/>
                <circle cx="140" cy="136" r="8"  fill="#ffdb80" stroke="#7a4220" stroke-width="2" opacity="0.9"/>
                <circle cx="192" cy="130" r="8"  fill="#ffdb80" stroke="#7a4220" stroke-width="2" opacity="0.9"/>
                <!-- 窗口灯光闪 -->
                <circle cx="88"  cy="132" r="4" fill="rgba(255,230,100,0.7)"/>
                <circle cx="140" cy="136" r="4" fill="rgba(255,230,100,0.7)"/>
                <circle cx="192" cy="130" r="4" fill="rgba(255,230,100,0.7)"/>
              </svg>
            </div>

            <!-- 宝岛 -->
            <div class="hero-island">
              <div class="hero-island__glow"></div>
              <span class="hero-island__palm">🌴</span>
              <span class="hero-island__chest">💰</span>
              <span class="hero-island__label">宝岛终点</span>
            </div>

            <!-- 罗盘 -->
            <div class="hero-compass-wrap">
              <div class="hero-compass">🧭</div>
            </div>

            <!-- 虚线航路 -->
            <svg class="hero-route" viewBox="0 0 400 140" preserveAspectRatio="none">
              <path
                d="M30 80 C80 50, 140 100, 200 70 C260 40, 320 90, 370 50"
                stroke="rgba(255,240,180,0.7)"
                stroke-width="4"
                stroke-dasharray="10 14"
                stroke-linecap="round"
                fill="none"
              />
              <!-- 起点锚 -->
              <text x="22" y="95" font-size="18" text-anchor="middle">⚓</text>
              <!-- 终点旗 -->
              <text x="374" y="64" font-size="18" text-anchor="middle">🚩</text>
            </svg>
          </div>
        </div>

        <!-- ══ 操作面板 ══ -->
        <article class="scene-panel start-panel stack">
          <span class="scene-caption">⚓ 准备起航</span>
          <h2 class="panel-title">先把今天的船队<br>叫上船</h2>

          <div class="mode-picker" data-role="mode-picker">
            ${[
              ['solo-ai',    '1人 + AI 船长', '🤖'],
              ['local-duo',  '本地双人对战',   '🧭'],
            ].map(([mode, label, icon]) => `
              <button
                class="count-option mode-btn"
                data-mode="${mode}"
                data-active="${mode === selectedMode}"
                aria-pressed="${mode === selectedMode}"
                type="button"
              >
                <span class="mode-btn__icon">${icon}</span>
                <span class="mode-btn__label">${label}</span>
              </button>
            `).join('')}
          </div>

          <label class="stack">
            <span class="field-label">🏴‍☠️ 1 号船长的名字</span>
            <input id="player-name-0" class="name-field" value="你" maxlength="12" />
          </label>

          <div data-role="second-player-field"></div>

          <div class="stack">
            <span class="field-label">出航名单</span>
            <div class="crew-preview" data-role="crew-preview"></div>
          </div>

          <button class="action-button action-button--primary start-cta" data-role="start-adventure" type="button">
            <span class="start-cta__icon">⛵</span>
            <span>开始冒险</span>
          </button>
          <p class="helper-text">同屏轮流玩，一局很快，孩子不需要先看规则。</p>
        </article>
      </div>
    </section>
  `;

  const nameInput = root.querySelector('#player-name-0');
  const previewRoot = root.querySelector('[data-role="crew-preview"]');
  const secondPlayerField = root.querySelector('[data-role="second-player-field"]');
  let secondNameInput = null;

  function getSecondPlayerName() {
    if (selectedMode === 'local-duo') {
      return secondNameInput?.value || '2 号船长';
    }
    return '海盗1';
  }

  function syncModeButtons() {
    root.querySelectorAll('[data-mode]').forEach((button) => {
      const active = button.dataset.mode === selectedMode;
      button.dataset.active = String(active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function renderSecondPlayerField() {
    if (selectedMode !== 'local-duo') {
      secondPlayerField.innerHTML = `
        <p class="helper-text">默认由 AI 帮你掌舵另一艘船，想同屏对战时再切到本地双人。</p>
      `;
      secondNameInput = null;
      return;
    }

    secondPlayerField.innerHTML = `
      <label class="stack">
        <span class="field-label">⚓ 2 号船长的名字</span>
        <input id="player-name-1" class="name-field" value="伙伴" maxlength="12" />
      </label>
    `;
    secondNameInput = secondPlayerField.querySelector('#player-name-1');
    secondNameInput?.addEventListener('input', () => renderPreview());
  }

  function renderPreview() {
    previewRoot.innerHTML = Array.from({ length: 2 }, (_, index) => {
      const isAIPlayer = index === 1 && selectedMode === 'solo-ai';
      const name = index === 0 ? (nameInput.value || '你') : getSecondPlayerName();
      return `
        <span class="preview-pill" data-ai="${isAIPlayer}">
          ${isAIPlayer ? '🤖' : '🧭'} ${name}
        </span>
      `;
    }).join('');
  }

  syncModeButtons();
  renderSecondPlayerField();
  renderPreview();

  nameInput.addEventListener('input', () => renderPreview());

  root.querySelectorAll('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedMode = button.dataset.mode || 'solo-ai';
      syncModeButtons();
      renderSecondPlayerField();
      renderPreview();
    });
  });

  root.querySelector('[data-role="start-adventure"]').addEventListener('click', () => {
    const captainName = nameInput.value || '你';
    const partnerName = getSecondPlayerName();
    onStart({
      players: [
        { name: captainName, isAI: false },
        { name: partnerName, isAI: selectedMode === 'solo-ai' },
      ],
    });
  });
}
