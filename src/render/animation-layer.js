import { getCellMeta } from '../core/board-data.js';

const DEFAULT_SIZE = { width: 960, height: 640 };

function getOrCreateCanvas(root) {
  let canvas = root.querySelector('[data-role="animation-canvas"]');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.dataset.role = 'animation-canvas';
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

function drawVignette(ctx, width, height) {
  const gradient = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    height * 0.2,
    width * 0.5,
    height * 0.5,
    height * 0.8,
  );
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
  gradient.addColorStop(1, 'rgba(2, 24, 57, 0.22)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawPulse(ctx, width, height, position) {
  const cell = getCellMeta(position);
  if (!cell) {
    return;
  }

  const point = toCanvasPoint(cell, width, height);
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255, 250, 194, 0.85)';
  ctx.lineWidth = 3;
  ctx.arc(point.x, point.y, 22, 0, Math.PI * 2);
  ctx.stroke();
}

export function renderAnimationLayer(root, { state = {}, size = DEFAULT_SIZE } = {}) {
  if (!root.style.position) {
    root.style.position = 'relative';
  }

  const canvas = getOrCreateCanvas(root);
  canvas.width = size.width;
  canvas.height = size.height;
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.borderRadius = '20px';

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return canvas;
  }

  ctx.clearRect(0, 0, size.width, size.height);
  drawVignette(ctx, size.width, size.height);
  drawPulse(ctx, size.width, size.height, state.currentPlayer?.position ?? 1);

  return canvas;
}
