import { boardPath, boardStickers, getCellMeta } from '../core/board-data.js';
import { getPlayerBadgeText } from '../core/players.js';

const DEFAULT_SIZE = { width: 1440, height: 900 };
const STICKER_ICONS = {
  star: '⭐',
  dice: '🎲',
  gem: '💎',
  octopus: '🐙',
  shark: '🦈',
  bridge: '🌉',
  swirl: '🌀',
  pirate: '🏴‍☠️',
  ladder: '🪜',
};

const CHIP_CLUSTER_LAYOUTS = {
  1: [[0, -26]],
  2: [[-16, -22], [16, -30]],
  3: [[0, -34], [-18, -14], [18, -16]],
  4: [[-16, -30], [16, -30], [-16, -10], [16, -10]],
};
const INNER_RING_START = 82;
const INNER_RING_END = 99;
const PROP_SHORT_NAMES = new Map(
  boardStickers.map((sticker) => [sticker.cell, sticker.text]),
);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function projectPathPoint(cell) {
  const dx = cell.x - INNER_RING_CENTER.x;
  const dy = cell.y - INNER_RING_CENTER.y;
  const distance = Math.hypot(dx, dy);
  const radialScale = distance > 0.34 ? 1.12 : distance > 0.23 ? 1.05 : 0.9;
  const projectedX = INNER_RING_CENTER.x + dx * radialScale;
  const projectedY = INNER_RING_CENTER.y + dy * radialScale;

  return {
    x: clamp(projectedX, 0.04, 0.96),
    y: clamp(projectedY, 0.05, 0.95),
  };
}

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

function rotateOffset([offsetX, offsetY], rotation = 0) {
  const angle = (rotation * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: offsetX * cos - offsetY * sin,
    y: offsetX * sin + offsetY * cos,
  };
}

function getChipClusterOffset(slotIndex, clusterSize, rotation = 0) {
  const layout = CHIP_CLUSTER_LAYOUTS[Math.min(Math.max(clusterSize, 1), 4)] ?? CHIP_CLUSTER_LAYOUTS[4];
  const baseOffset = layout[slotIndex] ?? [0, -26];
  return rotateOffset(baseOffset, rotation);
}

function getInnerRingCenter() {
  const innerRing = boardPath.filter(({ index }) => index >= INNER_RING_START && index <= INNER_RING_END);

  if (innerRing.length === 0) {
    return { x: 0.53, y: 0.48 };
  }

  const xs = innerRing.map(({ x }) => x);
  const ys = innerRing.map(({ y }) => y);

  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2,
  };
}

const INNER_RING_CENTER = getInnerRingCenter();
const DISPLAY_PATH = boardPath.map((cell) => {
  const projected = projectPathPoint(cell);
  return { ...cell, ...projected };
});
const DISPLAY_PATH_BY_INDEX = new Map(DISPLAY_PATH.map((cell) => [cell.index, cell]));

function drawBoardWater(ctx, width, height) {
  const seaGradient = ctx.createLinearGradient(0, 0, 0, height);
  seaGradient.addColorStop(0, '#73c8ff');
  seaGradient.addColorStop(0.42, '#68c2ff');
  seaGradient.addColorStop(1, '#9be8ff');
  ctx.fillStyle = seaGradient;
  ctx.fillRect(0, 0, width, height);

  const horizonGlow = ctx.createRadialGradient(width * 0.5, height * 0.26, 30, width * 0.5, height * 0.26, width * 0.46);
  horizonGlow.addColorStop(0, 'rgba(255, 250, 214, 0.42)');
  horizonGlow.addColorStop(1, 'rgba(255, 250, 214, 0)');
  ctx.fillStyle = horizonGlow;
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

  ctx.save();
  const confettiColors = ['rgba(255, 241, 120, 0.44)', 'rgba(255, 126, 120, 0.28)', 'rgba(121, 212, 255, 0.32)'];
  for (let index = 0; index < 18; index += 1) {
    ctx.fillStyle = confettiColors[index % confettiColors.length];
    const x = width * (0.06 + ((index * 0.051) % 0.88));
    const y = height * (0.1 + ((index * 0.083) % 0.78));
    ctx.beginPath();
    ctx.arc(x, y, 3 + (index % 3), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawRouteGuideline(ctx, width, height) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.setLineDash([10, 16]);
  ctx.strokeStyle = 'rgba(255, 249, 205, 0.22)';
  ctx.lineWidth = 18;
  ctx.beginPath();
  DISPLAY_PATH
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

  const lineGradient = ctx.createLinearGradient(0, height * 0.84, width, height * 0.16);
  lineGradient.addColorStop(0, 'rgba(255, 239, 177, 0.88)');
  lineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
  lineGradient.addColorStop(1, 'rgba(192, 247, 255, 0.92)');
  ctx.setLineDash([8, 14]);
  ctx.strokeStyle = lineGradient;
  ctx.lineWidth = 8;
  ctx.beginPath();
  DISPLAY_PATH
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
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  DISPLAY_PATH
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
  const centerX = width * INNER_RING_CENTER.x;
  const centerY = height * INNER_RING_CENTER.y;
  const sandCenterY = centerY;
  const foliageLeftY = centerY - 36;
  const foliageRightY = centerY - 46;
  const chestOuterTop = centerY - 40;
  const chestInnerTop = centerY - 32;

  ctx.save();
  const islandGlow = ctx.createRadialGradient(centerX, centerY - 16, 30, centerX, centerY - 16, 240);
  islandGlow.addColorStop(0, 'rgba(255, 236, 166, 0.94)');
  islandGlow.addColorStop(0.46, 'rgba(255, 211, 120, 0.26)');
  islandGlow.addColorStop(1, 'rgba(255, 236, 166, 0)');
  ctx.fillStyle = islandGlow;
  ctx.fillRect(centerX - 260, centerY - 216, 520, 340);

  const stageGradient = ctx.createLinearGradient(centerX, centerY - 86, centerX, centerY + 90);
  stageGradient.addColorStop(0, '#ffe88c');
  stageGradient.addColorStop(1, '#f7cc6c');
  ctx.fillStyle = stageGradient;
  ctx.beginPath();
  ctx.ellipse(centerX, sandCenterY, 216, 94, -0.04, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#61b56a';
  ctx.beginPath();
  ctx.ellipse(centerX - 64, foliageLeftY, 92, 42, -0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(centerX + 26, foliageRightY, 108, 50, 0.1, 0, Math.PI * 2);
  ctx.fill();

  drawPalmTree(ctx, centerX - 100, centerY - 8, 1.06);
  drawPalmTree(ctx, centerX - 30, centerY, 0.94);
  drawPalmTree(ctx, centerX + 84, centerY - 12, 0.84);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(centerX, centerY - 2, 154, Math.PI * 0.18, Math.PI * 0.82);
  ctx.stroke();

  ctx.fillStyle = '#f5d14e';
  for (let index = 0; index < 22; index += 1) {
    const angle = (Math.PI * 2 * index) / 18;
    const radiusX = 106 + (index % 3) * 16;
    const radiusY = 30 + (index % 2) * 22;
    ctx.beginPath();
    ctx.arc(
      centerX + Math.cos(angle) * radiusX,
      centerY + 26 + Math.sin(angle) * radiusY,
      8,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  ctx.fillStyle = '#ff7f66';
  for (let index = 0; index < 10; index += 1) {
    const x = centerX - 152 + index * 34;
    const heightOffset = index % 2 === 0 ? 18 : 6;
    ctx.beginPath();
    ctx.moveTo(x, centerY - 76);
    ctx.lineTo(x + 16, centerY - 100 - heightOffset);
    ctx.lineTo(x + 16, centerY - 68);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = '#5a3518';
  ctx.fillRect(centerX - 58, chestOuterTop, 116, 72);
  ctx.fillStyle = '#8d5c2e';
  ctx.fillRect(centerX - 52, chestInnerTop, 104, 60);
  ctx.strokeStyle = '#2d1a0f';
  ctx.lineWidth = 4;
  ctx.strokeRect(centerX - 52, chestInnerTop, 104, 60);

  ctx.fillStyle = '#392012';
  ctx.beginPath();
  ctx.moveTo(centerX - 60, centerY - 32);
  ctx.lineTo(centerX + 4, centerY - 78);
  ctx.lineTo(centerX + 66, centerY - 42);
  ctx.lineTo(centerX, centerY - 10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#f4d04b';
  ctx.fillRect(centerX - 9, centerY - 10, 18, 18);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.beginPath();
  ctx.arc(centerX - 20, centerY - 24, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function renderBoardTiles(root, state = {}) {
  const tileLayer = getOrCreateLayer(root, 'board-number-layer', 'board-number-layer');
  const currentPosition = state.currentPlayer?.position ?? 1;
  const trailSet = new Set((state.animation?.trail ?? []).map((step) => String(step)));
  const activeCell = state.animation?.activeCell ?? currentPosition;
  const landedCell = state.animation?.landedCell ?? null;

  Object.assign(tileLayer.style, {
    position: 'absolute',
    inset: '0',
    pointerEvents: 'none',
    zIndex: '4',
  });

  tileLayer.innerHTML = DISPLAY_PATH
    .filter(({ index }) => index !== 100)
    .map((cell) => {
      const isCurrent = cell.index === currentPosition;
      const isLandmark = cell.kind === 'landmark';
      const isFinalBend = false;
      const isFinishLane = false;
      const landmarkStyle = isLandmark ? cell.landmarkStyle : null;
      const isTrail = trailSet.has(String(cell.index));
      const isActive = cell.index === activeCell;
      const isLanded = cell.index === landedCell;

      const cellLabel = isLandmark ? (PROP_SHORT_NAMES.get(cell.index) ?? cell.index) : cell.index;
      const landmarkIcon = isLandmark ? (STICKER_ICONS[landmarkStyle] ?? '✨') : '';
      return `
        <span
          class="board-cell-label ${isLandmark ? 'board-cell-label--landmark' : ''} ${isFinalBend ? 'board-cell-label--final-bend' : ''} ${isFinishLane ? 'board-cell-label--finish-lane' : ''} ${landmarkStyle ? `board-cell-label--landmark-${landmarkStyle}` : ''} ${isCurrent ? 'board-cell-label--current' : ''} ${isTrail ? 'board-cell-label--trail' : ''} ${isActive ? 'board-cell-label--active' : ''} ${isLanded ? 'board-cell-label--landed' : ''}"
          data-cell-label="${cell.index}"
          data-cell-kind="${cell.kind}"
          data-landmark-style="${landmarkStyle ?? ''}"
          data-final-bend="${isFinalBend}"
          data-finish-lane="${isFinishLane}"
          data-trail="${isTrail}"
          data-active="${isActive}"
          data-landed="${isLanded}"
          style="left:${(cell.x * 100).toFixed(2)}%;top:${(cell.y * 100).toFixed(2)}%;--cell-rotation:${cell.rotation.toFixed(2)}deg;"
        >
          ${isLandmark
    ? `<span class="board-cell-label__icon" aria-hidden="true">${landmarkIcon}</span><span class="board-cell-label__name">${cellLabel}</span>`
    : `<span class="board-cell-label__value">${cellLabel}</span>`}
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
    pointerEvents: 'auto',
    zIndex: '3',
  });

  stickerLayer.innerHTML = '';
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
    <div class="board-center-sign" data-role="board-center-sign" data-cell-label="100" style="left:${(INNER_RING_CENTER.x * 100).toFixed(2)}%;top:${(INNER_RING_CENTER.y * 100).toFixed(2)}%;">
      <div class="board-center-sign__sparkles" data-role="board-finish-sparkles" aria-hidden="true">
        <span>✨</span>
        <span>🎉</span>
        <span>✨</span>
      </div>
      <span class="board-center-sign__flag">终点</span>
      <span class="board-center-sign__value">100</span>
    </div>
  `;
}

function renderPlayerChips(root, state = {}) {
  const playerLayer = getOrCreateLayer(root, 'board-player-layer', 'board-player-layer');
  const crew = Array.isArray(state.crew) ? state.crew : [];
  const motionPlayerId = state.animation?.playerId ?? null;
  const motionPhase = state.animation?.phase ?? 'idle';
  const chipClusters = new Map();

  crew.forEach((player) => {
    const position = player.position ?? 1;
    const cluster = chipClusters.get(position) ?? [];
    cluster.push(player);
    chipClusters.set(position, cluster);
  });

  Object.assign(playerLayer.style, {
    position: 'absolute',
    inset: '0',
    pointerEvents: 'none',
    zIndex: '6',
  });

  playerLayer.innerHTML = crew
    .map((player, index) => {
      const rawCell = getCellMeta(player.position ?? 1);
      const cell = DISPLAY_PATH_BY_INDEX.get(rawCell?.index ?? -1) ?? rawCell;
      if (!cell || cell.index === 100) {
        return '';
      }

      const cluster = chipClusters.get(cell.index) ?? [player];
      const clusterIndex = Math.max(0, cluster.findIndex(({ id }) => id === player.id));
      const chipOffset = getChipClusterOffset(clusterIndex, cluster.length, cell.rotation);
      const playerMotion = player.id === motionPlayerId ? motionPhase : '';
      const badgeText = getPlayerBadgeText(player.name, index + 1);

      return `
        <div
          class="board-player-chip ${playerMotion ? `board-player-chip--${playerMotion}` : ''}"
          data-player-chip="${index + 1}"
          data-player-name="${player.name ?? ''}"
          data-motion="${playerMotion}"
          style="left:calc(${(cell.x * 100).toFixed(2)}% + ${chipOffset.x.toFixed(2)}px);top:calc(${(cell.y * 100).toFixed(2)}% + ${chipOffset.y.toFixed(2)}px);--chip-color:${player.color ?? '#ff6b6b'};"
          title="${player.name} · 第 ${player.position ?? cell.index} 格"
        >
          <span class="board-player-chip__shadow" aria-hidden="true"></span>
          <span class="board-player-chip__ring" aria-hidden="true"></span>
          <span class="board-player-chip__badge">${badgeText}</span>
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
