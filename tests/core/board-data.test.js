import { describe, expect, it } from 'vitest';
import { boardPath, getCellMeta, zoneOrder } from '../../src/core/board-data.js';

describe('board data', () => {
  it('exposes 100 route cells with zone metadata', () => {
    expect(boardPath).toHaveLength(100);
    expect(zoneOrder.length).toBeGreaterThan(1);
    expect(getCellMeta(1)).toMatchObject({ index: 1 });
    expect(getCellMeta(100)).toMatchObject({ index: 100 });
  });

  it('stretches the route across the widescreen board with a longer multi-loop path', () => {
    const xs = boardPath.map(({ x }) => x);
    const ys = boardPath.map(({ y }) => y);
    const segments = boardPath.slice(1).map((cell, index) => {
      const previous = boardPath[index];
      return Math.hypot(cell.x - previous.x, cell.y - previous.y);
    });
    const totalDistance = segments.reduce((distance, segment) => distance + segment, 0);
    const centerLaneCount = boardPath.filter(({ x, y, index }) => (
      index !== 100
      && x > 0.24
      && x < 0.8
      && y > 0.22
      && y < 0.7
    )).length;

    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(0.82);
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(0.74);
    expect(totalDistance).toBeGreaterThan(4.5);
    expect(Math.max(...segments) / Math.min(...segments)).toBeLessThan(3.2);
    expect(centerLaneCount).toBeGreaterThan(18);
    expect(boardPath.every(({ rotation }) => rotation <= 90 && rotation >= -90)).toBe(true);
  });
});
