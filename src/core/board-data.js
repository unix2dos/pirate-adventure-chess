export const zoneOrder = ['sunny-bay', 'bubble-strait', 'octopus-cove', 'treasure-run'];

export const boardPath = Array.from({ length: 100 }, (_, index) => ({ index: index + 1 }));

export function getCellMeta(index) {
  return boardPath[index - 1];
}
