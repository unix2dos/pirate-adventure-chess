import { describe, expect, it } from 'vitest';
import { boardPath } from '../../src/core/board-data.js';

const INNER_RING_START = 82;
const INNER_RING_END = 99;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getInnerRingCenter() {
  const innerRing = boardPath.filter(({ index }) => index >= INNER_RING_START && index <= INNER_RING_END);
  const xs = innerRing.map(({ x }) => x);
  const ys = innerRing.map(({ y }) => y);
  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2,
  };
}

function projectPathPoint(cell, center) {
  const dx = cell.x - center.x;
  const dy = cell.y - center.y;
  const distance = Math.hypot(dx, dy);
  const radialScale = distance > 0.34 ? 1.12 : distance > 0.23 ? 1.05 : 0.9;
  return {
    ...cell,
    x: clamp(center.x + dx * radialScale, 0.04, 0.96),
    y: clamp(center.y + dy * radialScale, 0.05, 0.95),
  };
}

function minDistance(points, width, height) {
  let min = Number.POSITIVE_INFINITY;
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const dx = (points[i].x - points[j].x) * width;
      const dy = (points[i].y - points[j].y) * height;
      min = Math.min(min, Math.hypot(dx, dy));
    }
  }
  return min;
}

describe('responsive ring spacing', () => {
  it('keeps sufficient center-point spacing after adaptive ring expansion', () => {
    const center = getInnerRingCenter();
    const displayPath = boardPath
      .filter(({ index }) => index !== 100)
      .map((cell) => projectPathPoint(cell, center));

    const desktopMinDistance = minDistance(displayPath, 1440, 900);
    const tabletMinDistance = minDistance(displayPath, 1024, 640);
    const mobileMinDistance = minDistance(displayPath, 390, 244);

    // Thresholds are tuned to ensure labels stay legible and non-overlapping in the refreshed UI.
    expect(desktopMinDistance).toBeGreaterThan(33);
    expect(tabletMinDistance).toBeGreaterThan(24);
    expect(mobileMinDistance).toBeGreaterThan(9);
  });
});
