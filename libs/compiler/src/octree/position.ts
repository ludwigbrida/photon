export const getChildIndex = (
  position: readonly [number, number, number],
  level: number,
): number => {
  const [x, y, z] = position;

  const xBit = (x >> level) & 1;
  const yBit = (y >> level) & 1;
  const zBit = (z >> level) & 1;

  return xBit | (yBit << 1) | (zBit << 2);
};
