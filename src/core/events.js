export const NO_EVENT = null;

const BOARD_EVENTS = [
  {
    id: 'WISH_STAR',
    stickerId: 'wish-star',
    cell: 14,
    emoji: '⭐',
    style: 'star',
    title: '许愿星',
    detail: '+1 或 +2',
    description: '捞到星星后，选一股顺风把船往前送。',
    trigger: '落到第 14 格时触发',
    effectText: '二选一：前进 1 格或前进 2 格',
    example: '例如你停在第 14 格，选 +2 后会立刻前进到第 16 格。',
    offsetX: 0,
    offsetY: 0.08,
    rotation: -4,
    choices: [
      { label: '+1格', value: { type: 'move', steps: 1 } },
      { label: '+2格', value: { type: 'move', steps: 2 } },
    ],
  },
  {
    id: 'BONUS_ROLL',
    stickerId: 'bonus-roll',
    cell: 27,
    emoji: '🎲',
    style: 'dice',
    title: '幸运骰',
    detail: '再掷一次',
    description: '海流把你送进好运带，这回合还能再摇一次。',
    trigger: '落到第 27 格时触发',
    effectText: '处理完本格后，仍然轮到你继续掷骰',
    example: '例如你从第 26 格走到第 27 格，这回合不会切到下一位玩家。',
    offsetX: 0.05,
    offsetY: 0.06,
    rotation: -8,
    effect: { type: 'extra-turn', count: 1 },
  },
  {
    id: 'GEM_REEF',
    stickerId: 'gem-reef',
    cell: 36,
    emoji: '💎',
    style: 'gem',
    title: '宝石礁',
    detail: '下回合 +1',
    description: '宝石光照亮航线，下回合能多借一阵风。',
    trigger: '落到第 36 格时触发',
    effectText: '你的下一次掷骰结果额外 +1 步',
    example: '例如你下回合掷出 3，实际会前进 4 格。',
    offsetX: 0.08,
    offsetY: -0.01,
    rotation: -8,
    effect: { type: 'roll-modifier', amount: 1 },
  },
  {
    id: 'OCTOPUS',
    stickerId: 'octopus',
    cell: 46,
    emoji: '🐙',
    style: 'octopus',
    title: '章鱼海怪',
    detail: '暂停一回合',
    description: '触手缠住了船帆，你得先停下来整理一下。',
    trigger: '落到第 46 格时触发',
    effectText: '下一次轮到你时，直接暂停一回合',
    example: '例如你这一回合停在第 46 格，下次轮到你时不会掷骰。',
    offsetX: 0.06,
    offsetY: -0.03,
    rotation: -12,
    effect: { type: 'skip-turns', turns: 1 },
  },
  {
    id: 'SHARK_BITE',
    stickerId: 'shark-bite',
    cell: 55,
    emoji: '🦈',
    style: 'shark',
    title: '鲨鱼湾',
    detail: '后退 3 格',
    description: '鲨鱼从侧面拍起浪头，把你往后冲了一段。',
    trigger: '落到第 55 格时触发',
    effectText: '立刻后退 3 格',
    example: '例如停在第 55 格时，会立刻退回到第 52 格。',
    offsetX: 0.02,
    offsetY: -0.08,
    rotation: -8,
    effect: { type: 'move', steps: -3 },
  },
  {
    id: 'BRIDGE',
    stickerId: 'bridge',
    cell: 60,
    emoji: '🌉',
    style: 'bridge',
    title: '木桥近道',
    detail: '跳到 68',
    description: '你找到了近道木桥，可以直接抄一段海湾。',
    trigger: '落到第 60 格时触发',
    effectText: '立刻跳到第 68 格',
    example: '例如你停在第 60 格，会直接移动到第 68 格。',
    offsetX: 0.04,
    offsetY: -0.08,
    rotation: -4,
    effect: { type: 'jump', target: 68 },
  },
  {
    id: 'WHIRLPOOL',
    stickerId: 'whirlpool',
    cell: 66,
    emoji: '🌀',
    style: 'swirl',
    title: '旋涡海流',
    detail: '退回 61',
    description: '船被旋涡卷住，只能顺着海流退回外侧航道。',
    trigger: '落到第 66 格时触发',
    effectText: '立刻退回到第 61 格',
    example: '例如你停在第 66 格，会被卷回到第 61 格重新出发。',
    offsetX: -0.02,
    offsetY: -0.08,
    rotation: 4,
    effect: { type: 'jump', target: 61 },
  },
  {
    id: 'PIRATE',
    stickerId: 'pirate',
    cell: 72,
    emoji: '🏴‍☠️',
    style: 'pirate',
    title: '海盗靠岸',
    detail: '选奖励',
    description: '岸边海盗在招手，你可以挑一种更适合当前局面的帮助。',
    trigger: '落到第 72 格时触发',
    effectText: '二选一：立刻前进 2 格，或下回合额外 +1 步',
    example: '例如你想稳一点，就选“下回合 +1”；想抢节奏，就选“立刻 +2”。',
    offsetX: -0.09,
    offsetY: -0.03,
    rotation: 8,
    choices: [
      { label: '立刻前进 2 格', value: { type: 'move', steps: 2 } },
      { label: '下回合 +1 步', value: { type: 'roll-modifier', amount: 1 } },
    ],
  },
  {
    id: 'LADDER',
    stickerId: 'ladder',
    cell: 78,
    emoji: '🪜',
    style: 'ladder',
    title: '梯桥近路',
    detail: '跳到 88',
    description: '你爬上了高处木梯，直接切进更靠近终点的航道。',
    trigger: '落到第 78 格时触发',
    effectText: '立刻跳到第 88 格',
    example: '例如你停在第 78 格，会直接跳到第 88 格。',
    offsetX: -0.09,
    offsetY: 0.02,
    rotation: 8,
    effect: { type: 'jump', target: 88 },
  },
  {
    id: 'INNER_SWIRL',
    stickerId: 'inner-swirl',
    cell: 86,
    emoji: '🌀',
    style: 'swirl',
    title: '内海旋涡',
    detail: '下回合 -1',
    description: '靠近宝箱的海流更急，下回合要先慢一拍。',
    trigger: '落到第 86 格时触发',
    effectText: '你的下一次掷骰结果减少 1 步，但最低仍会前进 1 格',
    example: '例如你下回合掷出 2，实际只前进 1 格。',
    offsetX: -0.10,
    offsetY: -0.02,
    rotation: -8,
    effect: { type: 'roll-modifier', amount: -1 },
  },
];

const BOARD_EVENT_MAP = new Map(BOARD_EVENTS.map((event) => [event.cell, event]));

function cloneEvent(event) {
  return event ? structuredClone(event) : null;
}

function clampPosition(position) {
  return Math.min(100, Math.max(1, position));
}

function describeEffect(event, effect) {
  if (!effect) {
    return { title: event.title };
  }

  switch (effect.type) {
    case 'move':
      return {
        title: effect.steps >= 0
          ? `${event.title}助你前进${effect.steps}格`
          : `${event.title}把你吹退${Math.abs(effect.steps)}格`,
      };
    case 'jump':
      return { title: `${event.title}带你跳到第 ${effect.target} 格` };
    case 'extra-turn':
      return { title: `${event.title}让你再掷一次` };
    case 'skip-turns':
      return { title: `${event.title}让你暂停 ${effect.turns} 回合` };
    case 'roll-modifier':
      return {
        title: effect.amount >= 0
          ? `${event.title}让你下回合多走 ${effect.amount} 格`
          : `${event.title}让你下回合少走 ${Math.abs(effect.amount)} 格`,
      };
    default:
      return { title: event.title };
  }
}

function normalizeSelectedEffect(event, choiceValue) {
  if (choiceValue && typeof choiceValue === 'object' && 'type' in choiceValue) {
    return choiceValue;
  }

  if (event?.effect) {
    return event.effect;
  }

  if (event?.id === 'WISH_STAR') {
    const step = Number.isFinite(Number(choiceValue)) ? Number(choiceValue) : 1;
    return { type: 'move', steps: Math.min(2, Math.max(1, step)) };
  }

  return null;
}

function applyEffect(player, effect) {
  if (!player || !effect) {
    return;
  }

  switch (effect.type) {
    case 'move':
      player.position = clampPosition(player.position + effect.steps);
      break;
    case 'jump':
      player.position = clampPosition(effect.target);
      break;
    case 'extra-turn':
      player.extraTurns = (player.extraTurns ?? 0) + (effect.count ?? 1);
      break;
    case 'skip-turns':
      player.skipTurns = (player.skipTurns ?? 0) + (effect.turns ?? 1);
      break;
    case 'roll-modifier':
      player.rollModifier = (player.rollModifier ?? 0) + (effect.amount ?? 0);
      break;
    default:
      break;
  }
}

export const boardEventCards = BOARD_EVENTS.map((event) => ({ ...event }));

export function resolveBoardEvent(position) {
  return cloneEvent(BOARD_EVENT_MAP.get(position) ?? NO_EVENT);
}

export function getBoardEventById(eventId) {
  return cloneEvent(BOARD_EVENTS.find(({ id, stickerId }) => id === eventId || stickerId === eventId) ?? NO_EVENT);
}

export function applyBoardEvent({ player, event, choiceValue }) {
  if (!player || !event) {
    return null;
  }

  const effect = normalizeSelectedEffect(event, choiceValue);
  applyEffect(player, effect);

  return describeEffect(event, effect);
}
