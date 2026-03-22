import { describe, expect, it } from 'vitest';
import { boardPath, getCellMeta, zoneOrder } from '../../src/core/board-data.js';

describe('board data', () => {
  it('exposes 100 route cells with zone metadata', () => {
    expect(boardPath).toHaveLength(100);
    expect(zoneOrder.length).toBeGreaterThan(1);
    expect(getCellMeta(1)).toMatchObject({ index: 1 });
    expect(getCellMeta(100)).toMatchObject({ index: 100 });
  });
});
