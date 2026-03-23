import { boardPath, getCellMeta, zoneOrder } from '../core/board-data.js';

const DEFAULT_SIZE = { width: 960, height: 640 };
const ZONE_COLORS = {
  'sunny-bay': '#8ed7ff',
  'bubble-strait': '#98f2d6',
  'octopus-cove': '#7fc2ff',
  'treasure-run': '#ffe083',
};

function getOrCreateCanvas(root) {
  let canvas = root.querySelector('[data-role="board-canvas"]');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.dataset.role = 'board-canvas';
    root.appendChild(canvas);
  }

  return canvas;
}

function toCanvasPoint(cell, width, height) {
  return {
    x: cell.x * width,
    y: cell.y * height,
  };
}

function drawSeaBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#7bd6ff');
  gradient.addColorStop(1, '#0d5cab');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawZoneBands(ctx, width, height) {
  const bandHeight = height / zoneOrder.length;
  zoneOrder.forEach((zoneId, index) => {
    ctx.fillStyle = ZONE_COLORS[zoneId] ?? '#7fbde9';
    ctx.globalAlpha = 0.24;
    ctx.fillRect(0, index * bandHeight, width, bandHeight);
  });
  ctx.globalAlpha = 1;
}

function drawAdventureRoute(ctx, width, height) {
  ctx.beginPath();
  boardPath.forEach((cell, index) => {
    const point = toCanvasPoint(cell, width, height);
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
      return;
    }
    ctx.lineTo(point.x, point.y);
  });
  ctx.strokeStyle = '#fff6cf';
  ctx.lineWidth = 18;
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
  ctx.strokeStyle = '#ff8f63';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function drawRouteCells(ctx, width, height) {
  boardPath.forEach((cell) => {
    const point = toCanvasPoint(cell, width, height);
    const isLandmark = cell.kind === 'landmark' || cell.kind === 'finish';
    ctx.beginPath();
    ctx.fillStyle = isLandmark ? '#ffcf5a' : '#ffffff';
    ctx.arc(point.x, point.y, isLandmark ? 7 : 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawCurrentPositionHighlight(ctx, width, height, position) {
  const cell = getCellMeta(position);
  if (!cell) {
    return;
  }

  const point = toCanvasPoint(cell, width, height);
  ctx.beginPath();
  ctx.strokeStyle = '#ffe96c';
  ctx.lineWidth = 5;
  ctx.arc(point.x, point.y, 14, 0, Math.PI * 2);
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
    ctx.fillStyle = player.color ?? '#ff6b6b';
    ctx.arc(point.x + offsetX, point.y + offsetY, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function renderBoardRenderer(root, { state = {}, size = DEFAULT_SIZE } = {}) {
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

  return canvas;
}
