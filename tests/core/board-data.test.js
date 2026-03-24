import { describe, expect, it } from 'vitest';
import { resolveBoardEvent } from '../../src/core/events.js';
import { boardPath, getCellMeta, zoneOrder } from '../../src/core/board-data.js';
import { boardStickers } from '../../src/core/board-data.js';

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
    expect(centerLaneCount).toBeGreaterThan(15);
    expect(boardPath.every(({ rotation }) => rotation <= 90 && rotation >= -90)).toBe(true);
  });

  it('keeps every visible sticker aligned with a real event cell, including expanded prop stages', () => {
    expect(resolveBoardEvent(13)).toBeNull();
    expect(resolveBoardEvent(14)?.title).toBe('许愿星');
    expect(resolveBoardEvent(92)?.title).toBeTruthy();
    expect(boardStickers.length).toBeGreaterThanOrEqual(20);
    expect(boardStickers.every((sticker) => resolveBoardEvent(sticker.cell))).toBe(true);
  });

  it('spreads expanded prop stages across mid and late game cells', () => {
    const eventCells = boardStickers.map((sticker) => sticker.cell);
    const midGameCount = eventCells.filter((cell) => cell >= 45 && cell <= 74).length;
    const lateGameCount = eventCells.filter((cell) => cell >= 75 && cell <= 96).length;

    expect(midGameCount).toBeGreaterThanOrEqual(6);
    expect(lateGameCount).toBeGreaterThanOrEqual(5);
  });

  it('keeps the last route around the island readable instead of collapsing into a sprint cluster', () => {
    const finish = getCellMeta(100);
    const finalLane = boardPath.slice(89, 99);
    const distances = finalLane.map((cell) => Math.hypot(cell.x - finish.x, cell.y - finish.y));
    const laneSegments = finalLane.slice(1).map((cell, index) => {
      const previous = finalLane[index];
      return Math.hypot(cell.x - previous.x, cell.y - previous.y);
    });

    expect(finalLane).toHaveLength(10);
    expect(Math.max(...distances) - Math.min(...distances)).toBeGreaterThan(0.08);
    expect(Math.min(...laneSegments)).toBeGreaterThan(0.055);
  });

  it('keeps the full 82-99 finish route evenly spaced for regular play', () => {
    const finishRoute = boardPath.slice(81, 99);
    const laneSegments = finishRoute.slice(1).map((cell, index) => {
      const previous = finishRoute[index];
      return Math.hypot(cell.x - previous.x, cell.y - previous.y);
    });

    expect(finishRoute).toHaveLength(18);
    expect(Math.min(...laneSegments)).toBeGreaterThan(0.04);
    expect(Math.max(...laneSegments) / Math.min(...laneSegments)).toBeLessThan(1.5);
  });
});
