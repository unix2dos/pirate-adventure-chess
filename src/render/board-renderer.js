import { boardPath, getCellMeta, getZoneMeta, zoneOrder } from '../core/board-data.js';

const DEFAULT_SIZE = { width: 960, height: 640 };
const ZONE_COLORS = {
  'sunny-bay': '#95dcff',
  'bubble-strait': '#96f0cf',
  'octopus-cove': '#7eafff',
  'treasure-run': '#ffd96f',
};

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

function toCanvasPoint(cell, width, height) {
  return {
    x: cell.x * width,
    y: cell.y * height,
  };
}

function drawSeaBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#9de4ff');
  gradient.addColorStop(0.4, '#4cc5f4');
  gradient.addColorStop(1, '#1566b9');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const sun = ctx.createRadialGradient(width * 0.14, height * 0.14, 10, width * 0.14, height * 0.14, 160);
  sun.addColorStop(0, 'rgba(255, 239, 148, 0.95)');
  sun.addColorStop(1, 'rgba(255, 239, 148, 0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, width, height);
}

function drawWaveTexture(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2;

  for (let index = 0; index < 12; index += 1) {
    const y = height * (0.12 + index * 0.065);
    ctx.beginPath();
    for (let x = 0; x <= width; x += 24) {
      const wave = Math.sin((x / width) * Math.PI * 4 + index) * 8;
      if (x === 0) {
        ctx.moveTo(x, y + wave);
      } else {
        ctx.lineTo(x, y + wave);
      }
    }
    ctx.stroke();
  }

  ctx.restore();
}

function drawZoneBands(ctx, width, height) {
  zoneOrder.forEach((zoneId, index) => {
    const top = height * (0.08 + index * 0.22);
    const bandHeight = height * 0.21;
    const meta = getZoneMeta(zoneId);

    ctx.save();
    ctx.fillStyle = ZONE_COLORS[zoneId] ?? '#7fbde9';
    ctx.globalAlpha = 0.24;
    ctx.beginPath();
    ctx.moveTo(width * 0.04, top);
    ctx.quadraticCurveTo(width * 0.34, top - 28, width * 0.58, top + 10);
    ctx.quadraticCurveTo(width * 0.84, top + 36, width * 0.96, top + 8);
    ctx.lineTo(width * 0.96, top + bandHeight);
    ctx.quadraticCurveTo(width * 0.66, top + bandHeight + 28, width * 0.38, top + bandHeight - 10);
    ctx.quadraticCurveTo(width * 0.18, top + bandHeight - 32, width * 0.04, top + bandHeight + 8);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgba(16, 49, 89, 0.86)';
    ctx.font = '800 24px "Trebuchet MS", "PingFang SC", sans-serif';
    ctx.fillText(meta?.label ?? zoneId, width * 0.07, top + 34);
    ctx.fillStyle = 'rgba(16, 49, 89, 0.65)';
    ctx.font = '600 14px "Avenir Next", "PingFang SC", sans-serif';
    ctx.fillText(meta?.objective ?? '', width * 0.07, top + 58);
    ctx.restore();
  });
}

function drawAdventureRoute(ctx, width, height) {
  ctx.save();
  ctx.beginPath();
  boardPath.forEach((cell, index) => {
    const point = toCanvasPoint(cell, width, height);
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
      return;
    }
    ctx.lineTo(point.x, point.y);
  });
  ctx.strokeStyle = '#fff7d8';
  ctx.lineWidth = 22;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  ctx.beginPath();
  boardPath.forEach((cell, index) => {
    const point = toCanvasPoint(cell, width, height);
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
      return;
    }
    ctx.lineTo(point.x, point.y);
  });
  ctx.strokeStyle = '#ff8a61';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.setLineDash([10, 16]);
  ctx.stroke();
  ctx.restore();
}

function drawLandmarkIsland(ctx, point, scale = 1) {
  ctx.save();
  ctx.translate(point.x, point.y + 18);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#fff2ab';
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5cc98a';
  ctx.beginPath();
  ctx.moveTo(-2, -2);
  ctx.quadraticCurveTo(-16, -28, -8, -34);
  ctx.quadraticCurveTo(0, -20, -2, -2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(2, -2);
  ctx.quadraticCurveTo(18, -26, 10, -32);
  ctx.quadraticCurveTo(0, -18, 2, -2);
  ctx.fill();
  ctx.restore();
}

function drawRouteCells(ctx, width, height) {
  boardPath.forEach((cell) => {
    const point = toCanvasPoint(cell, width, height);
    const isLandmark = cell.kind === 'landmark' || cell.kind === 'finish';
    if (isLandmark) {
      drawLandmarkIsland(ctx, point, cell.kind === 'finish' ? 1.1 : 0.86);
    }

    ctx.beginPath();
    ctx.fillStyle = isLandmark ? '#ffd86b' : '#ffffff';
    ctx.arc(point.x, point.y, isLandmark ? 9 : 5, 0, Math.PI * 2);
    ctx.fill();

    if (isLandmark) {
      ctx.fillStyle = '#16314a';
      ctx.font = cell.kind === 'finish'
        ? '900 16px "Trebuchet MS", sans-serif'
        : '900 12px "Trebuchet MS", sans-serif';
      ctx.fillText(cell.kind === 'finish' ? '★' : '✦', point.x - 5, point.y + 5);
    }
  });
}

function drawCurrentPositionHighlight(ctx, width, height, position) {
  const cell = getCellMeta(position);
  if (!cell) {
    return;
  }

  const point = toCanvasPoint(cell, width, height);
  ctx.beginPath();
  ctx.strokeStyle = '#fff3a6';
  ctx.lineWidth = 5;
  ctx.arc(point.x, point.y, 16, 0, Math.PI * 2);
  ctx.stroke();
}

function drawCrewMarkers(ctx, width, height, crew) {
  crew.forEach((player, index) => {
    const cell = getCellMeta(player.position ?? 1);
    if (!cell) {
      return;
    }

    const point = toCanvasPoint(cell, width, height);
    const offsetX = (index % 3) * 10 - 10;
    const offsetY = Math.floor(index / 3) * 10 - 10;
    ctx.beginPath();
    ctx.fillStyle = '#ffffff';
    ctx.arc(point.x + offsetX, point.y + offsetY, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = player.color ?? '#ff6b6b';
    ctx.arc(point.x + offsetX, point.y + offsetY, 5.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function renderBoardLabels(root, state = {}) {
  const labelLayer = getOrCreateLayer(root, 'board-number-layer', 'board-number-layer');
  const playerLayer = getOrCreateLayer(root, 'board-player-layer', 'board-player-layer');
  const currentPosition = state.currentPlayer?.position ?? 1;
  const crew = Array.isArray(state.crew) ? state.crew : [];

  Object.assign(labelLayer.style, {
    position: 'absolute',
    inset: '0',
    pointerEvents: 'none',
    zIndex: '2',
  });

  Object.assign(playerLayer.style, {
    position: 'absolute',
    inset: '0',
    pointerEvents: 'none',
    zIndex: '3',
  });

  labelLayer.innerHTML = boardPath
    .map((cell) => {
      const isCurrent = cell.index === currentPosition;
      const isLandmark = cell.kind === 'landmark' || cell.kind === 'finish';
      const offsetY = isLandmark ? -22 : cell.index % 2 === 0 ? 16 : -16;

      return `
        <span
          class="board-cell-label ${isLandmark ? 'board-cell-label--landmark' : ''} ${isCurrent ? 'board-cell-label--current' : ''}"
          data-cell-label="${cell.index}"
          style="left:${(cell.x * 100).toFixed(2)}%;top:calc(${(cell.y * 100).toFixed(2)}% + ${offsetY}px);"
        >
          ${cell.index}
        </span>
      `;
    })
    .join('');

  playerLayer.innerHTML = crew
    .map((player, index) => {
      const cell = getCellMeta(player.position ?? 1);
      if (!cell) {
        return '';
      }

      const offsetX = index % 2 === 0 ? -20 : 20;
      const offsetY = -38 - Math.floor(index / 2) * 18;

      return `
        <div
          class="board-player-chip"
          data-player-chip="${index + 1}"
          style="left:calc(${(cell.x * 100).toFixed(2)}% + ${offsetX}px);top:calc(${(cell.y * 100).toFixed(2)}% + ${offsetY}px);--chip-color:${player.color ?? '#ff6b6b'};"
          title="${index + 1}号 ${player.name}"
        >
          <span class="board-player-chip__badge">${index + 1}</span>
          <span class="board-player-chip__name">${player.name}</span>
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
  canvas.style.borderRadius = '20px';

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return canvas;
  }

  drawSeaBackground(ctx, size.width, size.height);
  drawWaveTexture(ctx, size.width, size.height);
  drawZoneBands(ctx, size.width, size.height);
  drawAdventureRoute(ctx, size.width, size.height);
  drawRouteCells(ctx, size.width, size.height);
  drawCurrentPositionHighlight(
    ctx,
    size.width,
    size.height,
    state.currentPlayer?.position ?? 1,
  );
  drawCrewMarkers(ctx, size.width, size.height, state.crew ?? []);
  renderBoardLabels(root, state);

  return canvas;
}
