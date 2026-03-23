import { getCellMeta } from '../core/board-data.js';

const DEFAULT_SIZE = { width: 1440, height: 900 };
const LINK_PHASES = new Set(['rolling', 'moving', 'landing', 'result']);

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

function getDiceOrigin(width, height) {
  return {
    x: width - 108,
    y: height - 108,
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

function drawTrailGlow(ctx, width, height, trail = []) {
  const validTrail = trail
    .map((position) => getCellMeta(position))
    .filter(Boolean);

  if (validTrail.length === 0) {
    return;
  }

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(255, 245, 177, 0.46)';
  ctx.lineWidth = 10;
  ctx.beginPath();
  validTrail.forEach((cell, index) => {
    const point = toCanvasPoint(cell, width, height);
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.stroke();

  validTrail.forEach((cell, index) => {
    const point = toCanvasPoint(cell, width, height);
    const radius = index === validTrail.length - 1 ? 34 : 24;
    const glow = ctx.createRadialGradient(point.x, point.y, 3, point.x, point.y, radius);
    glow.addColorStop(0, index === validTrail.length - 1 ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 247, 212, 0.68)');
    glow.addColorStop(1, 'rgba(255, 247, 212, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawLandingBurst(ctx, width, height, position, phase) {
  const cell = getCellMeta(position);
  if (!cell || !phase) {
    return;
  }

  const point = toCanvasPoint(cell, width, height);
  ctx.save();
  ctx.strokeStyle = phase === 'landing' ? 'rgba(255, 153, 120, 0.92)' : 'rgba(255, 243, 167, 0.9)';
  ctx.lineWidth = phase === 'landing' ? 6 : 4;
  ctx.beginPath();
  ctx.arc(point.x, point.y, phase === 'landing' ? 34 : 28, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.68)';
  for (let index = 0; index < 6; index += 1) {
    const angle = (Math.PI * 2 * index) / 6;
    const sparkX = point.x + Math.cos(angle) * 26;
    const sparkY = point.y + Math.sin(angle) * 26;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawDiceLink(ctx, width, height, animation = {}) {
  if (!LINK_PHASES.has(animation?.phase)) {
    return;
  }

  const cell = getCellMeta(animation?.activeCell);
  if (!cell) {
    return;
  }

  const origin = getDiceOrigin(width, height);
  const point = toCanvasPoint(cell, width, height);
  const distanceX = origin.x - point.x;
  const controlX = origin.x - Math.max(120, Math.abs(distanceX) * 0.42);
  const controlY = Math.min(origin.y, point.y) - (animation.phase === 'rolling' ? 130 : 88);

  ctx.save();
  const linkGradient = ctx.createLinearGradient(origin.x, origin.y, point.x, point.y);
  linkGradient.addColorStop(0, 'rgba(255, 173, 101, 0.08)');
  linkGradient.addColorStop(0.42, 'rgba(255, 255, 255, 0.34)');
  linkGradient.addColorStop(1, animation.phase === 'rolling' ? 'rgba(255, 242, 177, 0.78)' : 'rgba(255, 239, 197, 0.58)');
  ctx.strokeStyle = linkGradient;
  ctx.lineWidth = animation.phase === 'rolling' ? 8 : 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.setLineDash(animation.phase === 'rolling' ? [16, 14] : []);
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.quadraticCurveTo(controlX, controlY, point.x, point.y);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.fillStyle = animation.phase === 'rolling' ? 'rgba(255, 255, 255, 0.64)' : 'rgba(255, 246, 212, 0.42)';
  [0.24, 0.5, 0.76].forEach((progress) => {
    const inverse = 1 - progress;
    const sparkX = inverse * inverse * origin.x + 2 * inverse * progress * controlX + progress * progress * point.x;
    const sparkY = inverse * inverse * origin.y + 2 * inverse * progress * controlY + progress * progress * point.y;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, animation.phase === 'rolling' ? 3.4 : 2.6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawDiceSpark(ctx, width, height, animation = {}) {
  if (animation?.phase !== 'rolling') {
    return;
  }

  const { x, y } = getDiceOrigin(width, height);
  ctx.save();
  const glow = ctx.createRadialGradient(x, y, 8, x, y, 56);
  glow.addColorStop(0, 'rgba(255, 255, 255, 0.62)');
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, 56, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 227, 130, 0.56)';
  ctx.lineWidth = 3;
  for (let index = 0; index < 4; index += 1) {
    const radius = 22 + index * 9;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
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
  canvas.dataset.phase = state.animation?.phase ?? '';
  canvas.dataset.diceValue = Number.isFinite(state.animation?.diceValue) ? String(state.animation.diceValue) : '';
  canvas.dataset.activeCell = Number.isFinite(state.animation?.activeCell) ? String(state.animation.activeCell) : '';
  canvas.dataset.trail = Array.isArray(state.animation?.trail) ? state.animation.trail.join(',') : '';

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return canvas;
  }

  ctx.clearRect(0, 0, size.width, size.height);
  drawVignette(ctx, size.width, size.height);
  drawDiceLink(ctx, size.width, size.height, state.animation);
  drawTrailGlow(ctx, size.width, size.height, state.animation?.trail ?? []);
  drawDiceSpark(ctx, size.width, size.height, state.animation);
  drawPulse(ctx, size.width, size.height, state.animation?.activeCell ?? state.currentPlayer?.position ?? 1);
  drawLandingBurst(
    ctx,
    size.width,
    size.height,
    state.animation?.landedCell ?? state.animation?.activeCell,
    state.animation?.phase,
  );

  return canvas;
}
