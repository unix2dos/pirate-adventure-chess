const DEFAULT_NAMES = ['你', '海盗甲', '海盗乙', '海盗丙'];

export function getPlayerBadgeText(name, fallbackIndex = 1) {
  const safeName = String(name ?? '').trim();
  if (!safeName) {
    return `P${fallbackIndex}`;
  }

  const words = safeName.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    return words
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase?.() ?? word[0] ?? '')
      .join('');
  }

  const hanCharacters = [...safeName].filter((character) => /\p{Script=Han}/u.test(character));
  const digitMatch = safeName.match(/\d/);
  if (hanCharacters.length >= 2 && digitMatch) {
    return `${hanCharacters[0]}${digitMatch[0]}`;
  }

  if (hanCharacters.length >= 2) {
    return hanCharacters.slice(-2).join('');
  }

  return [...safeName].slice(0, 2).join('').toUpperCase();
}

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
