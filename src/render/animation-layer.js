import { getCellMeta } from '../core/board-data.js';

const DEFAULT_SIZE = { width: 1440, height: 900 };

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

function drawTrailParticles(ctx, width, height, trail = [], phase = 'idle') {
  if (!Array.isArray(trail) || trail.length === 0 || (phase !== 'moving' && phase !== 'landing' && phase !== 'result')) {
    return;
  }

  ctx.save();
  trail
    .map((position) => getCellMeta(position))
    .filter(Boolean)
    .forEach((cell, index) => {
      const point = toCanvasPoint(cell, width, height);
      const burst = index === trail.length - 1 ? 5 : 3;
      for (let spark = 0; spark < burst; spark += 1) {
        const angle = ((Math.PI * 2) / burst) * spark + index * 0.4;
        const distance = index === trail.length - 1 ? 22 : 12;
        const sparkX = point.x + Math.cos(angle) * distance;
        const sparkY = point.y + Math.sin(angle) * distance;
        ctx.fillStyle = index === trail.length - 1
          ? 'rgba(255, 247, 214, 0.9)'
          : 'rgba(255, 232, 164, 0.56)';
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, index === trail.length - 1 ? 3 : 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  ctx.restore();
}

function drawLandingRays(ctx, width, height, position, phase) {
  const cell = getCellMeta(position);
  if (!cell || (phase !== 'landing' && phase !== 'result')) {
    return;
  }

  const point = toCanvasPoint(cell, width, height);
  ctx.save();
  ctx.strokeStyle = phase === 'landing' ? 'rgba(255, 207, 120, 0.74)' : 'rgba(255, 242, 194, 0.72)';
  ctx.lineWidth = 2.6;
  for (let index = 0; index < 8; index += 1) {
    const angle = (Math.PI * 2 * index) / 8;
    const startRadius = 30;
    const endRadius = phase === 'landing' ? 48 : 42;
    ctx.beginPath();
    ctx.moveTo(
      point.x + Math.cos(angle) * startRadius,
      point.y + Math.sin(angle) * startRadius,
    );
    ctx.lineTo(
      point.x + Math.cos(angle) * endRadius,
      point.y + Math.sin(angle) * endRadius,
    );
    ctx.stroke();
  }
  ctx.restore();
}

function drawRollingAura(ctx, width, height, animation = {}) {
  if (animation?.phase !== 'rolling') {
    return;
  }

  const cell = getCellMeta(animation?.activeCell);
  if (!cell) {
    return;
  }

  const point = toCanvasPoint(cell, width, height);
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 234, 157, 0.34)';
  ctx.lineWidth = 2.4;
  for (let index = 0; index < 3; index += 1) {
    const radius = 26 + index * 9;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function renderAnimationLayer(root, { state = {}, size = DEFAULT_SIZE } = {}) {
  if (!root.style.position) {
    root.style.position = 'relative';
  }

  const canvas = getOrCreateCanvas(root);
  const dpr = Math.min(globalThis.devicePixelRatio || 1, 3);
  canvas.width = size.width * dpr;
  canvas.height = size.height * dpr;
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

  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, size.width, size.height);
  drawVignette(ctx, size.width, size.height);
  drawTrailGlow(ctx, size.width, size.height, state.animation?.trail ?? []);
  drawTrailParticles(ctx, size.width, size.height, state.animation?.trail ?? [], state.animation?.phase ?? 'idle');
  drawRollingAura(ctx, size.width, size.height, state.animation);
  drawPulse(ctx, size.width, size.height, state.animation?.activeCell ?? state.currentPlayer?.position ?? 1);
  drawLandingBurst(
    ctx,
    size.width,
    size.height,
    state.animation?.landedCell ?? state.animation?.activeCell,
    state.animation?.phase,
  );
  drawLandingRays(
    ctx,
    size.width,
    size.height,
    state.animation?.landedCell ?? state.animation?.activeCell,
    state.animation?.phase,
  );

  return canvas;
}
