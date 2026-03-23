export const zoneOrder = ['harbor-run', 'reef-rise', 'spiral-bay', 'treasure-core'];

const zoneMetaById = {
  'harbor-run': {
    id: 'harbor-run',
    label: '起航海湾',
    objective: '顺着外围航线前进',
  },
  'reef-rise': {
    id: 'reef-rise',
    label: '暗礁边线',
    objective: '绕过右侧险滩',
  },
  'spiral-bay': {
    id: 'spiral-bay',
    label: '漩涡内环',
    objective: '沿着内圈靠近宝箱',
  },
  'treasure-core': {
    id: 'treasure-core',
    label: '宝藏核心',
    objective: '冲上终点牌',
  },
};

const routeAnchors = [
  { index: 1, x: 0.13, y: 0.84, rotation: -10 },
  { index: 7, x: 0.29, y: 0.84, rotation: -6 },
  { index: 14, x: 0.51, y: 0.83, rotation: -4 },
  { index: 21, x: 0.75, y: 0.81, rotation: -10 },
  { index: 27, x: 0.88, y: 0.68, rotation: -12 },
  { index: 33, x: 0.9, y: 0.46, rotation: -10 },
  { index: 39, x: 0.82, y: 0.23, rotation: -8 },
  { index: 46, x: 0.62, y: 0.14, rotation: -4 },
  { index: 53, x: 0.37, y: 0.15, rotation: 4 },
  { index: 59, x: 0.17, y: 0.25, rotation: 8 },
  { index: 64, x: 0.11, y: 0.46, rotation: 2 },
  { index: 69, x: 0.16, y: 0.68, rotation: -4 },
  { index: 74, x: 0.34, y: 0.74, rotation: -10 },
  { index: 79, x: 0.59, y: 0.72, rotation: -10 },
  { index: 84, x: 0.76, y: 0.62, rotation: -10 },
  { index: 89, x: 0.75, y: 0.43, rotation: -12 },
  { index: 93, x: 0.61, y: 0.33, rotation: -6 },
  { index: 96, x: 0.43, y: 0.37, rotation: 4 },
  { index: 99, x: 0.35, y: 0.54, rotation: 10 },
  { index: 100, x: 0.52, y: 0.46, rotation: 0 },
];

export const boardStickers = [
  {
    id: 'wish-star',
    cell: 13,
    text: '许愿星',
    detail: '+1 或 +2',
    x: 0.87,
    y: 0.79,
    rotation: -8,
    style: 'star',
  },
  {
    id: 'bonus-roll',
    cell: 20,
    text: '幸运骰',
    detail: '再掷一次',
    x: 0.92,
    y: 0.7,
    rotation: -6,
    style: 'dice',
  },
  {
    id: 'gem-reef',
    cell: 24,
    text: '宝石礁',
    detail: '闪闪发光',
    x: 0.93,
    y: 0.45,
    rotation: -4,
    style: 'gem',
  },
  {
    id: 'octopus',
    cell: 32,
    text: '章鱼海怪',
    detail: '小心触手',
    x: 0.64,
    y: 0.08,
    rotation: 0,
    style: 'octopus',
  },
  {
    id: 'shark-bite',
    cell: 43,
    text: '鲨鱼湾',
    detail: '沿岸绕行',
    x: 0.08,
    y: 0.48,
    rotation: 0,
    style: 'shark',
  },
  {
    id: 'bridge',
    cell: 46,
    text: '木桥近道',
    detail: '穿过海湾',
    x: 0.19,
    y: 0.66,
    rotation: 0,
    style: 'bridge',
  },
  {
    id: 'whirlpool',
    cell: 54,
    text: '旋涡海流',
    detail: '贴边滑行',
    x: 0.28,
    y: 0.91,
    rotation: -4,
    style: 'swirl',
  },
  {
    id: 'pirate',
    cell: 61,
    text: '海盗靠岸',
    detail: '热闹一下',
    x: 0.76,
    y: 0.86,
    rotation: -10,
    style: 'pirate',
  },
  {
    id: 'ladder',
    cell: 72,
    text: '梯桥近路',
    detail: '一路向上',
    x: 0.81,
    y: 0.58,
    rotation: -20,
    style: 'ladder',
  },
  {
    id: 'inner-swirl',
    cell: 79,
    text: '内海旋涡',
    detail: '靠近宝箱',
    x: 0.56,
    y: 0.24,
    rotation: 2,
    style: 'swirl',
  },
];

function interpolateValue(start, end, progress) {
  return start + (end - start) * progress;
}

function getRoutePoint(index) {
  const exactAnchor = routeAnchors.find((anchor) => anchor.index === index);
  if (exactAnchor) {
    return exactAnchor;
  }

  for (let offset = 0; offset < routeAnchors.length - 1; offset += 1) {
    const start = routeAnchors[offset];
    const end = routeAnchors[offset + 1];

    if (index > start.index && index < end.index) {
      const progress = (index - start.index) / (end.index - start.index);
      return {
        x: interpolateValue(start.x, end.x, progress),
        y: interpolateValue(start.y, end.y, progress),
        rotation: interpolateValue(start.rotation, end.rotation, progress),
      };
    }
  }

  return routeAnchors[routeAnchors.length - 1];
}

function getZoneId(index) {
  if (index <= 28) {
    return 'harbor-run';
  }

  if (index <= 53) {
    return 'reef-rise';
  }

  if (index <= 89) {
    return 'spiral-bay';
  }

  return 'treasure-core';
}

const landmarkCells = new Set(boardStickers.map(({ cell }) => cell).concat([100]));

export const boardPath = Array.from({ length: 100 }, (_, offset) => {
  const index = offset + 1;
  const zoneId = getZoneId(index);
  const zoneMeta = zoneMetaById[zoneId];
  const point = getRoutePoint(index);

  return {
    index,
    zoneId,
    zoneLabel: zoneMeta.label,
    objective: zoneMeta.objective,
    x: point.x,
    y: point.y,
    rotation: point.rotation ?? 0,
    kind: index === 100 ? 'finish' : landmarkCells.has(index) ? 'landmark' : 'route',
  };
});

export function getCellMeta(index) {
  if (index < 1 || index > boardPath.length) {
    return null;
  }

  return boardPath[index - 1];
}

export function getZoneMeta(zoneId) {
  return zoneMetaById[zoneId] ?? null;
}
