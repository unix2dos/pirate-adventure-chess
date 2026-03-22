const DEFAULT_NAMES = ['你', '海盗甲', '海盗乙', '海盗丙'];

export function createPlayer({ id, name, color, isAI = false }) {
  return {
    id,
    name,
    color,
    isAI,
    position: 1,
    skipTurns: 0,
    turtleBuff: 0,
  };
}

export function createDefaultPlayerConfigs({ count, useAI }) {
  return Array.from({ length: Math.max(count, 2) }, (_, index) => ({
    name: DEFAULT_NAMES[index] ?? `海盗${index + 1}`,
    isAI: useAI && index > 0,
  }));
}
