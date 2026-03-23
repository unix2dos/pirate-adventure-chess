export const NO_EVENT = null;

const WISH_STAR_EVENT = {
  id: 'WISH_STAR',
  emoji: '⭐',
  title: '许愿星',
  description: '选择前进几格',
  choices: [
    { label: '+1格', value: 1 },
    { label: '+2格', value: 2 },
  ],
};

export function resolveBoardEvent(position) {
  if (position !== 13) {
    return NO_EVENT;
  }

  return structuredClone(WISH_STAR_EVENT);
}

export function applyBoardEvent({ player, event, choiceValue }) {
  if (!player || !event) {
    return null;
  }

  if (event.id === 'WISH_STAR') {
    const desiredStep = Number(choiceValue);
    const step = Number.isFinite(desiredStep)
      ? Math.min(2, Math.max(1, desiredStep))
      : 1;
    player.position = Math.min(100, player.position + step);
    return { title: `许愿星助力，前进${step}格` };
  }

  return null;
}
