export const zoneOrder = ['sunny-bay', 'bubble-strait', 'octopus-cove', 'treasure-run'];

const zoneMetaById = {
  'sunny-bay': {
    id: 'sunny-bay',
    label: '晴空湾',
    objective: '顺风航向灯塔',
  },
  'bubble-strait': {
    id: 'bubble-strait',
    label: '泡泡海峡',
    objective: '穿越跃浪航道',
  },
  'octopus-cove': {
    id: 'octopus-cove',
    label: '章鱼湾',
    objective: '避开触手礁石',
  },
  'treasure-run': {
    id: 'treasure-run',
    label: '宝藏冲刺',
    objective: '直达黄金终点',
  },
};

function getRoutePoint(index) {
  const cellsPerZone = 25;
  const zoneIndex = Math.min(
    Math.floor((index - 1) / cellsPerZone),
    zoneOrder.length - 1,
  );
  const localIndex = (index - 1) % cellsPerZone;
  const progress = localIndex / (cellsPerZone - 1);
  const movingRight = zoneIndex % 2 === 0;
  const x = movingRight ? 0.14 + progress * 0.72 : 0.86 - progress * 0.72;
  const yBase = 0.14 + zoneIndex * 0.23;
  const wave = movingRight
    ? Math.sin(progress * Math.PI) * 0.03
    : Math.cos(progress * Math.PI) * 0.03;

  return { x, y: yBase + wave };
}

export const boardPath = Array.from({ length: 100 }, (_, offset) => {
  const index = offset + 1;
  const zoneId = zoneOrder[Math.min(Math.floor((index - 1) / 25), zoneOrder.length - 1)];
  const zoneMeta = zoneMetaById[zoneId];
  const point = getRoutePoint(index);

  return {
    index,
    zoneId,
    zoneLabel: zoneMeta.label,
    objective: zoneMeta.objective,
    x: point.x,
    y: point.y,
    kind: index === 100 ? 'finish' : index % 10 === 0 ? 'landmark' : 'route',
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
