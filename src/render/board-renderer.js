import { boardPath, boardStickers, getCellMeta } from '../core/board-data.js';

const DEFAULT_SIZE = { width: 1440, height: 900 };

function getOrCreateCanvas(root) {
  let canvas = root.querySelector('[data-role="board-canvas"]');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.dataset.role = 'board-canvas';
    canvas.className = 'board-canvas';
    root.appendChild(canvas);
  }

  return canvas;
}

function getOrCreateLayer(root, role, className) {
  let layer = root.querySelector(`[data-role="${role}"]`);
  if (!layer) {
    layer = document.createElement('div');
    layer.dataset.role = role;
    layer.className = className;
    root.appendChild(layer);
  }

  return layer;
}

function drawBoardWater(ctx, width, height) {
  const seaGradient = ctx.createLinearGradient(0, 0, 0, height);
  seaGradient.addColorStop(0, '#7fc4ef');
  seaGradient.addColorStop(0.42, '#7bc1ee');
  seaGradient.addColorStop(1, '#96d6f7');
  ctx.fillStyle = seaGradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.11)';
  ctx.lineWidth = 2.4;
  for (let index = 0; index < 6; index += 1) {
    const y = height * (0.14 + index * 0.14);
    ctx.beginPath();
    for (let x = 0; x <= width; x += 30) {
      const wave = Math.sin((x / width) * Math.PI * 4 + index * 0.65) * 6;
      if (x === 0) {
        ctx.moveTo(x, y + wave);
      } else {
        ctx.lineTo(x, y + wave);
      }
    }
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  const glow = ctx.createRadialGradient(width * 0.52, height * 0.52, 70, width * 0.52, height * 0.52, width * 0.58);
  glow.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawRouteGuideline(ctx, width, height) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.setLineDash([12, 18]);
  ctx.strokeStyle = 'rgba(255, 247, 218, 0.56)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  boardPath
    .filter(({ index }) => index !== 100)
    .forEach((cell, index) => {
      const pointX = cell.x * width;
      const pointY = cell.y * height;
      if (index === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    });
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  boardPath
    .filter(({ index }) => index !== 100)
    .forEach((cell, index) => {
      const pointX = cell.x * width;
      const pointY = cell.y * height;
      if (index === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    });
  ctx.stroke();
  ctx.restore();
}

function drawPalmTree(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.strokeStyle = '#6b4f28';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-6, -26, 3, -58);
  ctx.stroke();

  ctx.fillStyle = '#50a34d';
  [
    [-28, -58, 0, -52, -8, -74],
    [26, -54, 3, -52, 12, -78],
    [-12, -48, 4, -52, -26, -88],
    [11, -47, 3, -52, 32, -84],
  ].forEach(([ax, ay, bx, by, cx, cy]) => {
    ctx.beginPath();
    ctx.moveTo(0, -54);
    ctx.quadraticCurveTo(ax, ay, cx, cy);
    ctx.quadraticCurveTo(bx, by, 0, -54);
    ctx.fill();
  });

  ctx.restore();
}

function drawCenterIsland(ctx, width, height) {
  const centerX = width * 0.53;
  const centerY = height * 0.48;

  ctx.save();
  const islandGlow = ctx.createRadialGradient(centerX, centerY + 40, 30, centerX, centerY + 40, 220);
  islandGlow.addColorStop(0, 'rgba(255, 236, 166, 0.85)');
  islandGlow.addColorStop(1, 'rgba(255, 236, 166, 0)');
  ctx.fillStyle = islandGlow;
  ctx.fillRect(centerX - 260, centerY - 170, 520, 340);

  ctx.fillStyle = '#ecd28c';
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + 46, 220, 104, -0.04, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#61b56a';
  ctx.beginPath();
  ctx.ellipse(centerX - 64, centerY + 10, 92, 42, -0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(centerX + 26, centerY - 2, 108, 50, 0.1, 0, Math.PI * 2);
  ctx.fill();

  drawPalmTree(ctx, centerX - 100, centerY + 38, 1.06);
  drawPalmTree(ctx, centerX - 30, centerY + 46, 0.94);
  drawPalmTree(ctx, centerX + 84, centerY + 34, 0.84);

  ctx.fillStyle = '#f5d14e';
  for (let index = 0; index < 22; index += 1) {
    const angle = (Math.PI * 2 * index) / 18;
    const radiusX = 106 + (index % 3) * 16;
    const radiusY = 30 + (index % 2) * 22;
    ctx.beginPath();
    ctx.arc(
      centerX + Math.cos(angle) * radiusX,
      centerY + 72 + Math.sin(angle) * radiusY,
      8,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  ctx.fillStyle = '#5a3518';
  ctx.fillRect(centerX - 58, centerY - 4, 116, 72);
  ctx.fillStyle = '#8d5c2e';
  ctx.fillRect(centerX - 52, centerY + 4, 104, 60);
  ctx.strokeStyle = '#2d1a0f';
  ctx.lineWidth = 4;
  ctx.strokeRect(centerX - 52, centerY + 4, 104, 60);

  ctx.fillStyle = '#392012';
  ctx.beginPath();
  ctx.moveTo(centerX - 60, centerY + 2);
  ctx.lineTo(centerX + 4, centerY - 44);
  ctx.lineTo(centerX + 66, centerY - 8);
  ctx.lineTo(centerX, centerY + 24);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#f4d04b';
  ctx.fillRect(centerX - 9, centerY + 24, 18, 18);

  ctx.restore();
}

function renderBoardTiles(root, state = {}) {
  const tileLayer = getOrCreateLayer(root, 'board-number-layer', 'board-number-layer');
  const currentPosition = state.currentPlayer?.position ?? 1;

  Object.assign(tileLayer.style, {
    position: 'absolute',
    inset: '0',
    pointerEvents: 'none',
    zIndex: '2',
  });

  tileLayer.innerHTML = boardPath
    .filter(({ index }) => index !== 100)
    .map((cell) => {
      const isCurrent = cell.index === currentPosition;
      const isLandmark = cell.kind === 'landmark';

      return `
        <span
          class="board-cell-label ${isLandmark ? 'board-cell-label--landmark' : ''} ${isCurrent ? 'board-cell-label--current' : ''}"
          data-cell-label="${cell.index}"
          style="left:${(cell.x * 100).toFixed(2)}%;top:${(cell.y * 100).toFixed(2)}%;--cell-rotation:${cell.rotation.toFixed(2)}deg;"
        >
          ${cell.index}
        </span>
      `;
    })
    .join('');
}

function renderBoardStickers(root) {
  const stickerLayer = getOrCreateLayer(root, 'board-sticker-layer', 'board-sticker-layer');

  Object.assign(stickerLayer.style, {
    position: 'absolute',
    inset: '0',
    pointerEvents: 'none',
    zIndex: '4',
  });

  stickerLayer.innerHTML = boardStickers
    .map((sticker) => `
      <div
        class="board-sticker board-sticker--${sticker.style}"
        data-board-sticker="${sticker.id}"
        style="left:${(sticker.x * 100).toFixed(2)}%;top:${(sticker.y * 100).toFixed(2)}%;--sticker-rotation:${sticker.rotation}deg;"
      >
        <span class="board-sticker__title">${sticker.text}</span>
        <span class="board-sticker__detail">${sticker.detail}</span>
      </div>
    `)
    .join('');
}

function renderCenterSign(root) {
  const centerLayer = getOrCreateLayer(root, 'board-center-layer', 'board-center-layer');

  Object.assign(centerLayer.style, {
    position: 'absolute',
    inset: '0',
    pointerEvents: 'none',
    zIndex: '5',
  });

  centerLayer.innerHTML = `
    <div class="board-center-sign" data-role="board-center-sign" data-cell-label="100">
      <span class="board-center-sign__flag">终点</span>
      <span class="board-center-sign__value">100</span>
    </div>
  `;
}

function renderPlayerChips(root, state = {}) {
  const playerLayer = getOrCreateLayer(root, 'board-player-layer', 'board-player-layer');
  const crew = Array.isArray(state.crew) ? state.crew : [];

  Object.assign(playerLayer.style, {
    position: 'absolute',
    inset: '0',
    pointerEvents: 'none',
    zIndex: '6',
  });

  playerLayer.innerHTML = crew
    .map((player, index) => {
      const cell = getCellMeta(player.position ?? 1);
      if (!cell || cell.index === 100) {
        return '';
      }

      const stackColumn = index % 2 === 0 ? -14 : 14;
      const stackRow = Math.floor(index / 2) * 14;

      return `
        <div
          class="board-player-chip"
          data-player-chip="${index + 1}"
          style="left:calc(${(cell.x * 100).toFixed(2)}% + ${stackColumn}px);top:calc(${(cell.y * 100).toFixed(2)}% - ${24 + stackRow}px);--chip-color:${player.color ?? '#ff6b6b'};"
          title="${index + 1}号 ${player.name}"
        >
          <span class="board-player-chip__badge">${index + 1}</span>
        </div>
      `;
    })
    .join('');
}

export function renderBoardRenderer(root, { state = {}, size = DEFAULT_SIZE } = {}) {
  if (!root.style.position) {
    root.style.position = 'relative';
  }

  const canvas = getOrCreateCanvas(root);
  canvas.width = size.width;
  canvas.height = size.height;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    renderBoardTiles(root, state);
    renderBoardStickers(root);
    renderCenterSign(root);
    renderPlayerChips(root, state);
    return canvas;
  }

  ctx.clearRect(0, 0, size.width, size.height);
  drawBoardWater(ctx, size.width, size.height);
  drawRouteGuideline(ctx, size.width, size.height);
  drawCenterIsland(ctx, size.width, size.height);

  renderBoardTiles(root, state);
  renderBoardStickers(root);
  renderCenterSign(root);
  renderPlayerChips(root, state);

  return canvas;
}
