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

const routeWaypoints = [
  { x: 0.09, y: 0.86 },
  { x: 0.30, y: 0.84 },
  { x: 0.58, y: 0.84 },
  { x: 0.82, y: 0.82 },
  { x: 0.94, y: 0.70 },
  { x: 0.97, y: 0.52 },
  { x: 0.96, y: 0.32 },
  { x: 0.90, y: 0.16 },
  { x: 0.72, y: 0.09 },
  { x: 0.46, y: 0.08 },
  { x: 0.22, y: 0.09 },
  { x: 0.08, y: 0.20 },
  { x: 0.05, y: 0.42 },
  { x: 0.06, y: 0.67 },
  { x: 0.16, y: 0.79 },
  { x: 0.34, y: 0.77 },
  { x: 0.58, y: 0.75 },
  { x: 0.79, y: 0.70 },
  { x: 0.87, y: 0.57 },
  { x: 0.88, y: 0.39 },
  { x: 0.82, y: 0.25 },
  { x: 0.66, y: 0.18 },
  { x: 0.43, y: 0.17 },
  { x: 0.24, y: 0.20 },
  { x: 0.13, y: 0.31 },
  { x: 0.12, y: 0.50 },
  { x: 0.20, y: 0.63 },
  { x: 0.35, y: 0.64 },
  { x: 0.56, y: 0.62 },
  { x: 0.70, y: 0.55 },
  { x: 0.72, y: 0.42 },
  { x: 0.67, y: 0.31 },
  { x: 0.55, y: 0.26 },
  { x: 0.40, y: 0.28 },
  { x: 0.31, y: 0.37 },
  { x: 0.30, y: 0.50 },
  { x: 0.38, y: 0.58 },
  { x: 0.51, y: 0.59 },
  { x: 0.61, y: 0.54 },
  { x: 0.62, y: 0.45 },
  { x: 0.57, y: 0.39 },
  { x: 0.52, y: 0.46 },
];

const boardStickerSpecs = [
  { id: 'wish-star', cell: 14, text: '许愿星', detail: '+1 或 +2', offsetX: 0, offsetY: 0.08, rotation: -4, style: 'star' },
  { id: 'bonus-roll', cell: 27, text: '幸运骰', detail: '再掷一次', offsetX: 0.05, offsetY: 0.06, rotation: -8, style: 'dice' },
  { id: 'gem-reef', cell: 36, text: '宝石礁', detail: '闪闪发光', offsetX: 0.08, offsetY: -0.01, rotation: -8, style: 'gem' },
  { id: 'octopus', cell: 46, text: '章鱼海怪', detail: '小心触手', offsetX: 0.06, offsetY: -0.03, rotation: -12, style: 'octopus' },
  { id: 'shark-bite', cell: 55, text: '鲨鱼湾', detail: '沿岸绕行', offsetX: 0.02, offsetY: -0.08, rotation: -8, style: 'shark' },
  { id: 'bridge', cell: 60, text: '木桥近道', detail: '穿过海湾', offsetX: 0.04, offsetY: -0.08, rotation: -4, style: 'bridge' },
  { id: 'whirlpool', cell: 66, text: '旋涡海流', detail: '贴边滑行', offsetX: -0.02, offsetY: -0.08, rotation: 4, style: 'swirl' },
  { id: 'pirate', cell: 72, text: '海盗靠岸', detail: '热闹一下', offsetX: -0.09, offsetY: -0.03, rotation: 8, style: 'pirate' },
  { id: 'ladder', cell: 78, text: '梯桥近路', detail: '一路向上', offsetX: -0.09, offsetY: 0.02, rotation: 8, style: 'ladder' },
  { id: 'inner-swirl', cell: 86, text: '内海旋涡', detail: '靠近宝箱', offsetX: -0.10, offsetY: -0.02, rotation: -8, style: 'swirl' },
];

function interpolateValue(start, end, progress) {
  return start + (end - start) * progress;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeRotation(angle) {
  if (angle > 90) {
    return angle - 180;
  }

  if (angle < -90) {
    return angle + 180;
  }

  return angle;
}

function buildRouteSegments(waypoints) {
  let distanceFromStart = 0;

  return waypoints.slice(1).map((end, index) => {
    const start = waypoints[index];
    const length = Math.hypot(end.x - start.x, end.y - start.y);
    const segment = {
      start,
      end,
      length,
      distanceFromStart,
      distanceToEnd: distanceFromStart + length,
      rotation: normalizeRotation((Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI),
    };

    distanceFromStart += length;
    return segment;
  });
}

const routeSegments = buildRouteSegments(routeWaypoints);
const totalRouteLength = routeSegments[routeSegments.length - 1]?.distanceToEnd ?? 0;

function getRoutePointByProgress(progress) {
  const targetDistance = totalRouteLength * progress;
  const segment = routeSegments.find((item, index) => (
    targetDistance <= item.distanceToEnd || index === routeSegments.length - 1
  ));

  if (!segment || segment.length === 0) {
    const lastPoint = routeWaypoints[routeWaypoints.length - 1];
    return { x: lastPoint.x, y: lastPoint.y, rotation: 0 };
  }

  const offset = targetDistance - segment.distanceFromStart;
  const segmentProgress = offset / segment.length;

  return {
    x: interpolateValue(segment.start.x, segment.end.x, segmentProgress),
    y: interpolateValue(segment.start.y, segment.end.y, segmentProgress),
    rotation: segment.rotation,
  };
}

function getZoneId(index) {
  if (index <= 30) {
    return 'harbor-run';
  }

  if (index <= 58) {
    return 'reef-rise';
  }

  if (index <= 84) {
    return 'spiral-bay';
  }

  return 'treasure-core';
}

const landmarkCells = new Set(boardStickerSpecs.map(({ cell }) => cell).concat([100]));
const sampledRoutePoints = Array.from({ length: 100 }, (_, offset) => getRoutePointByProgress(offset / 99));

export const boardPath = sampledRoutePoints.map((point, offset) => {
  const index = offset + 1;
  const zoneId = getZoneId(index);
  const zoneMeta = zoneMetaById[zoneId];

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

export const boardStickers = boardStickerSpecs.map((sticker) => {
  const point = sampledRoutePoints[sticker.cell - 1];

  return {
    ...sticker,
    x: clamp(point.x + sticker.offsetX, 0.05, 0.96),
    y: clamp(point.y + sticker.offsetY, 0.06, 0.94),
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
