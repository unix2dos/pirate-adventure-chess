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
const PROP_EVENT_IDS = new Map(
  boardStickers.map((sticker) => [sticker.cell, sticker.eventId]),
);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

// Exported so the animation layer can use the same projected coordinates as the DOM tiles
export function getDisplayCell(index) {
  return DISPLAY_PATH_BY_INDEX.get(index) ?? null;
}

function drawBoardWater(ctx, width, height) {
  // Rich ocean gradient
  const seaGradient = ctx.createLinearGradient(0, 0, 0, height);
  seaGradient.addColorStop(0, '#5abef5');
  seaGradient.addColorStop(0.3, '#63caff');
  seaGradient.addColorStop(0.7, '#7ed8ff');
  seaGradient.addColorStop(1, '#aaeeff');
  ctx.fillStyle = seaGradient;
  ctx.fillRect(0, 0, width, height);

  // Diagonal light shimmer
  const shimmer = ctx.createLinearGradient(0, 0, width, height);
  shimmer.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
  shimmer.addColorStop(0.4, 'rgba(255, 255, 255, 0)');
  shimmer.addColorStop(0.6, 'rgba(255, 255, 255, 0)');
  shimmer.addColorStop(1, 'rgba(255, 255, 255, 0.06)');
  ctx.fillStyle = shimmer;
  ctx.fillRect(0, 0, width, height);

  // Sun glow
  const horizonGlow = ctx.createRadialGradient(width * 0.5, height * 0.22, 20, width * 0.5, height * 0.22, width * 0.52);
  horizonGlow.addColorStop(0, 'rgba(255, 252, 200, 0.48)');
  horizonGlow.addColorStop(0.5, 'rgba(255, 240, 180, 0.18)');
  horizonGlow.addColorStop(1, 'rgba(255, 240, 180, 0)');
  ctx.fillStyle = horizonGlow;
  ctx.fillRect(0, 0, width, height);

  // Wave layers - two passes for depth
  ctx.save();
  for (let pass = 0; pass < 2; pass += 1) {
    const alpha = pass === 0 ? 0.09 : 0.14;
    const amplitude = pass === 0 ? 5 : 3.5;
    const freq = pass === 0 ? 3.5 : 5.2;
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = pass === 0 ? 2.8 : 1.8;
    for (let index = 0; index < 7; index += 1) {
      const y = height * (0.1 + index * 0.13 + pass * 0.06);
      ctx.beginPath();
      for (let x = 0; x <= width; x += 20) {
        const wave = Math.sin((x / width) * Math.PI * freq + index * 0.7 + pass * 1.2) * amplitude;
        const wave2 = Math.sin((x / width) * Math.PI * (freq * 1.6) + index * 1.1) * (amplitude * 0.4);
        if (x === 0) {
          ctx.moveTo(x, y + wave + wave2);
        } else {
          ctx.lineTo(x, y + wave + wave2);
        }
      }
      ctx.stroke();
    }
  }
  ctx.restore();

  // Center caustic glow
  ctx.save();
  const glow = ctx.createRadialGradient(width * 0.52, height * 0.5, 60, width * 0.52, height * 0.5, width * 0.62);
  glow.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // Sparkle dots
  ctx.save();
  const sparkleColors = [
    'rgba(255, 250, 200, 0.62)',
    'rgba(255, 255, 255, 0.5)',
    'rgba(180, 230, 255, 0.48)',
  ];
  for (let index = 0; index < 22; index += 1) {
    ctx.fillStyle = sparkleColors[index % sparkleColors.length];
    const x = width * (0.04 + ((index * 0.043) % 0.92));
    const y = height * (0.06 + ((index * 0.071) % 0.86));
    const r = 1.5 + (index % 4) * 0.8;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
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

  // 宝箱底座光晕：先画一个温暖的发光地基
  ctx.save();
  const chestGlow = ctx.createRadialGradient(centerX + 4, centerY + 20, 10, centerX + 4, centerY + 20, 110);
  chestGlow.addColorStop(0, 'rgba(255, 220, 60, 0.62)');
  chestGlow.addColorStop(0.5, 'rgba(255, 190, 30, 0.22)');
  chestGlow.addColorStop(1, 'rgba(255, 190, 30, 0)');
  ctx.fillStyle = chestGlow;
  ctx.beginPath();
  ctx.ellipse(centerX + 4, centerY + 24, 110, 44, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 宝箱主体——更饱和的棕色
  ctx.save();
  const chestBodyGrad = ctx.createLinearGradient(centerX - 58, chestOuterTop, centerX - 58, chestOuterTop + 72);
  chestBodyGrad.addColorStop(0, '#9b6030');
  chestBodyGrad.addColorStop(1, '#5a3010');
  ctx.fillStyle = chestBodyGrad;
  ctx.beginPath();
  ctx.roundRect(centerX - 58, chestOuterTop, 116, 72, 8);
  ctx.fill();

  // 宝箱内壁（稍浅）
  const chestInnerGrad = ctx.createLinearGradient(centerX - 52, chestInnerTop, centerX - 52, chestInnerTop + 60);
  chestInnerGrad.addColorStop(0, '#c4854a');
  chestInnerGrad.addColorStop(1, '#7a4520');
  ctx.fillStyle = chestInnerGrad;
  ctx.beginPath();
  ctx.roundRect(centerX - 52, chestInnerTop, 104, 60, 6);
  ctx.fill();
  ctx.strokeStyle = '#3a1a08';
  ctx.lineWidth = 3;
  ctx.strokeRect(centerX - 52, chestInnerTop, 104, 60);

  // 宝箱盖子——金属感梯形
  const lidGrad = ctx.createLinearGradient(centerX - 60, centerY - 78, centerX - 60, centerY - 10);
  lidGrad.addColorStop(0, '#c8803a');
  lidGrad.addColorStop(0.5, '#8d4e20');
  lidGrad.addColorStop(1, '#5a3010');
  ctx.fillStyle = lidGrad;
  ctx.beginPath();
  ctx.moveTo(centerX - 60, centerY - 32);
  ctx.lineTo(centerX + 4, centerY - 78);
  ctx.lineTo(centerX + 66, centerY - 42);
  ctx.lineTo(centerX, centerY - 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3a1a08';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // 金属扣锁——更大、更亮
  const claspGrad = ctx.createRadialGradient(centerX, centerY - 2, 2, centerX, centerY - 2, 14);
  claspGrad.addColorStop(0, '#fff8b0');
  claspGrad.addColorStop(0.5, '#f7d040');
  claspGrad.addColorStop(1, '#c8900a');
  ctx.fillStyle = claspGrad;
  ctx.beginPath();
  ctx.roundRect(centerX - 12, centerY - 14, 24, 24, 4);
  ctx.fill();
  ctx.strokeStyle = '#7a5a08';
  ctx.lineWidth = 2;
  ctx.strokeRect(centerX - 12, centerY - 14, 24, 24);

  // 金币从箱口溢出效果
  const coinColors = ['#ffd740', '#ffbf20', '#ffe880', '#f7c820'];
  for (let ci = 0; ci < 8; ci += 1) {
    const angle = (Math.PI * ci) / 5 - 0.3;
    const dist = 24 + (ci % 3) * 14;
    const cx2 = centerX + Math.cos(angle) * dist;
    const cy2 = chestInnerTop - 8 + Math.sin(angle) * 12;
    ctx.fillStyle = coinColors[ci % coinColors.length];
    ctx.beginPath();
    ctx.ellipse(cx2, cy2, 10, 7, angle * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(100, 60, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 宝箱顶部高光
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.beginPath();
  ctx.ellipse(centerX - 8, centerY - 54, 28, 10, -0.3, 0, Math.PI * 2);
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
    pointerEvents: 'auto',
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

      const eventId = isLandmark ? (PROP_EVENT_IDS.get(cell.index) ?? '') : '';
      return `
        <span
          class="board-cell-label ${isLandmark ? 'board-cell-label--landmark' : ''} ${isFinalBend ? 'board-cell-label--final-bend' : ''} ${isFinishLane ? 'board-cell-label--finish-lane' : ''} ${landmarkStyle ? `board-cell-label--landmark-${landmarkStyle}` : ''} ${isCurrent ? 'board-cell-label--current' : ''} ${isTrail ? 'board-cell-label--trail' : ''} ${isActive ? 'board-cell-label--active' : ''} ${isLanded ? 'board-cell-label--landed' : ''}"
          data-cell-label="${cell.index}"
          data-cell-kind="${cell.kind}"
          data-event-id="${eventId}"
          data-landmark-style="${landmarkStyle ?? ''}"
          data-final-bend="${isFinalBend}"
          data-finish-lane="${isFinishLane}"
          data-trail="${isTrail}"
          data-active="${isActive}"
          data-landed="${isLanded}"
          style="left:${(cell.x * 100).toFixed(2)}%;top:${(cell.y * 100).toFixed(2)}%;--cell-rotation:${cell.rotation.toFixed(2)}deg;"
        >
          <span class="board-cell-label__value">${cell.index}</span>${isLandmark ? '<span class="board-cell-label__dot" aria-hidden="true"></span>' : ''}
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

  if (stickerLayer.dataset.rendered === 'true') {
    return;
  }

  // Aspect ratio for correct link line geometry (16:10 board)
  const ASPECT_Y = 900 / 1440;

  const items = boardStickers.map((sticker) => {
    const projCell = DISPLAY_PATH_BY_INDEX.get(sticker.cell);
    if (!projCell) {
      return '';
    }

    // Apply sticker offset onto the projected cell position
    const offsetX = sticker.x - sticker.cellX;
    const offsetY = sticker.y - sticker.cellY;
    const stickerX = clamp(projCell.x + offsetX, 0.05, 0.96);
    const stickerY = clamp(projCell.y + offsetY, 0.06, 0.94);

    // Link line from sticker toward cell
    const dx = projCell.x - stickerX;
    const dy = projCell.y - stickerY;
    const linkWidthPct = Math.hypot(dx, dy * ASPECT_Y) * 100;
    const linkAngle = Math.atan2(dy * ASPECT_Y, dx) * (180 / Math.PI);

    // Pin direction: sticker above cell → pin extends downward
    const lift = stickerY < projCell.y ? 'up' : 'down';

    const icon = STICKER_ICONS[sticker.style] ?? '📌';
    const safeId = escapeHtml(sticker.id);
    const safeEventId = escapeHtml(sticker.eventId);
    const safeStyle = escapeHtml(sticker.style);
    const safeText = escapeHtml(sticker.text);
    const safeDetail = escapeHtml(sticker.detail);
    const safeTitle = escapeHtml(`${sticker.text}: ${sticker.detail}`);

    return [
      `<div class="board-sticker-link"`,
      `     style="left:${(stickerX * 100).toFixed(2)}%;top:${(stickerY * 100).toFixed(2)}%;width:${linkWidthPct.toFixed(2)}%;--link-angle:${linkAngle.toFixed(2)}deg;"`,
      `     aria-hidden="true"></div>`,
      `<button class="board-sticker board-sticker--${safeStyle}"`,
      `        data-board-sticker="${safeId}"`,
      `        data-event-id="${safeEventId}"`,
      `        data-lift="${lift}"`,
      `        style="left:${(stickerX * 100).toFixed(2)}%;top:${(stickerY * 100).toFixed(2)}%;--sticker-rotation:${sticker.rotation}deg;"`,
      `        type="button"`,
      `        title="${safeTitle}">`,
      `  <span class="board-sticker__icon" aria-hidden="true">${icon}</span>`,
      `  <span class="board-sticker__title">${safeText}</span>`,
      `  <span class="board-sticker__detail">${safeDetail}</span>`,
      `</button>`,
    ].join('\n');
  });

  // Use DOM methods to set content safely
  const fragment = document.createRange().createContextualFragment(items.join('\n'));
  stickerLayer.replaceChildren(fragment);

  stickerLayer.dataset.rendered = 'true';
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
  const dpr = Math.min(globalThis.devicePixelRatio || 1, 3);
  canvas.width = size.width * dpr;
  canvas.height = size.height * dpr;
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

  ctx.scale(dpr, dpr);
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
