export type Vector3 = readonly [number, number, number];

export const add = (lhs: Vector3, rhs: Vector3): Vector3 => [
  lhs[0] + rhs[0],
  lhs[1] + rhs[1],
  lhs[2] + rhs[2],
];

export const subtract = (lhs: Vector3, rhs: Vector3): Vector3 => [
  lhs[0] - rhs[0],
  lhs[1] - rhs[1],
  lhs[2] - rhs[2],
];

export const dot = (lhs: Vector3, rhs: Vector3): number => {
  return lhs[0] * rhs[0] + lhs[1] * rhs[1] + lhs[2] * rhs[2];
};

export const cross = (lhs: Vector3, rhs: Vector3): Vector3 => {
  return [
    lhs[1] * rhs[2] - lhs[2] * rhs[1],
    lhs[2] * rhs[0] - lhs[0] * rhs[2],
    lhs[0] * rhs[1] - lhs[1] * rhs[0],
  ];
};

export const scale = (vector: Vector3, amount: number): Vector3 => [
  vector[0] * amount,
  vector[1] * amount,
  vector[2] * amount,
];

export const normalize = (vector: Vector3): Vector3 => {
  const length = Math.hypot(vector[0], vector[1], vector[2]);

  // TODO: Handle zero-length vectors.

  return [vector[0] / length, vector[1] / length, vector[2] / length];
};
