import { describe, expect, it } from 'vitest';
import {
  boardEventCards,
  getBoardEventStageStats,
  propExpansionConfig,
  propStageConfig,
} from '../../src/core/events.js';

describe('prop stage config', () => {
  it('exposes configurable stage ranges for mid and late prop levels', () => {
    expect(propStageConfig.mid.start).toBe(45);
    expect(propStageConfig.mid.end).toBe(74);
    expect(propStageConfig.late.start).toBe(75);
    expect(propStageConfig.late.end).toBe(96);
  });

  it('keeps enough prop events in each configured stage bucket', () => {
    const stats = getBoardEventStageStats(boardEventCards);
    expect(stats.mid.total).toBeGreaterThanOrEqual(propExpansionConfig.minMidStageEvents);
    expect(stats.late.total).toBeGreaterThanOrEqual(propExpansionConfig.minLateStageEvents);
  });

  it('uses a configurable minimum target for total expanded prop events', () => {
    expect(propExpansionConfig.minTotalPropEvents).toBeGreaterThanOrEqual(20);
    expect(boardEventCards.length).toBeGreaterThanOrEqual(propExpansionConfig.minTotalPropEvents);
  });
});
