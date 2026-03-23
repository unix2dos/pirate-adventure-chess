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
  { index: 1, x: 0.43, y: 0.91, rotation: -12 },
  { index: 6, x: 0.56, y: 0.90, rotation: -6 },
  { index: 11, x: 0.77, y: 0.84, rotation: -10 },
  { index: 18, x: 0.87, y: 0.68, rotation: -10 },
  { index: 24, x: 0.89, y: 0.35, rotation: -8 },
  { index: 28, x: 0.76, y: 0.18, rotation: -8 },
  { index: 32, x: 0.60, y: 0.11, rotation: -2 },
  { index: 38, x: 0.28, y: 0.13, rotation: 8 },
  { index: 43, x: 0.12, y: 0.42, rotation: 2 },
  { index: 46, x: 0.13, y: 0.58, rotation: 0 },
  { index: 53, x: 0.27, y: 0.83, rotation: -14 },
  { index: 61, x: 0.69, y: 0.82, rotation: -8 },
  { index: 66, x: 0.79, y: 0.62, rotation: -10 },
  { index: 72, x: 0.75, y: 0.40, rotation: -14 },
  { index: 79, x: 0.51, y: 0.23, rotation: 4 },
  { index: 83, x: 0.34, y: 0.47, rotation: 6 },
  { index: 86, x: 0.33, y: 0.60, rotation: 2 },
  { index: 89, x: 0.37, y: 0.73, rotation: -8 },
  { index: 94, x: 0.60, y: 0.70, rotation: -10 },
  { index: 99, x: 0.73, y: 0.52, rotation: -10 },
  { index: 100, x: 0.60, y: 0.38, rotation: 0 },
];

export const boardStickers = [
  {
    id: 'wish-star',
    cell: 13,
    text: '许愿星',
    detail: '+1 或 +2',
    x: 0.87,
    y: 0.86,
    rotation: -8,
    style: 'star',
  },
  {
    id: 'bonus-roll',
    cell: 20,
    text: '幸运骰',
    detail: '再掷一次',
    x: 0.92,
    y: 0.58,
    rotation: -6,
    style: 'dice',
  },
  {
    id: 'gem-reef',
    cell: 24,
    text: '宝石礁',
    detail: '闪闪发光',
    x: 0.94,
    y: 0.34,
    rotation: -4,
    style: 'gem',
  },
  {
    id: 'octopus',
    cell: 32,
    text: '章鱼海怪',
    detail: '小心触手',
    x: 0.60,
    y: 0.07,
    rotation: 0,
    style: 'octopus',
  },
  {
    id: 'shark-bite',
    cell: 43,
    text: '鲨鱼湾',
    detail: '沿岸绕行',
    x: 0.08,
    y: 0.42,
    rotation: 0,
    style: 'shark',
  },
  {
    id: 'bridge',
    cell: 46,
    text: '木桥近道',
    detail: '穿过海湾',
    x: 0.15,
    y: 0.56,
    rotation: 0,
    style: 'bridge',
  },
  {
    id: 'whirlpool',
    cell: 54,
    text: '旋涡海流',
    detail: '贴边滑行',
    x: 0.34,
    y: 0.88,
    rotation: -4,
    style: 'swirl',
  },
  {
    id: 'pirate',
    cell: 61,
    text: '海盗靠岸',
    detail: '热闹一下',
    x: 0.75,
    y: 0.82,
    rotation: -10,
    style: 'pirate',
  },
  {
    id: 'ladder',
    cell: 72,
    text: '梯桥近路',
    detail: '一路向上',
    x: 0.79,
    y: 0.37,
    rotation: -20,
    style: 'ladder',
  },
  {
    id: 'inner-swirl',
    cell: 79,
    text: '内海旋涡',
    detail: '靠近宝箱',
    x: 0.52,
    y: 0.19,
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
