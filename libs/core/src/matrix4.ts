import type { Vector3 } from "./vector3.ts";

// Column-major layout, matching WGSL's mat4x4f layout.
export type Matrix4 = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export const multiplyMatrix = (lhs: Matrix4, rhs: Matrix4): Matrix4 => [
  lhs[0] * rhs[0] + lhs[4] * rhs[1] + lhs[8] * rhs[2] + lhs[12] * rhs[3],
  lhs[1] * rhs[0] + lhs[5] * rhs[1] + lhs[9] * rhs[2] + lhs[13] * rhs[3],
  lhs[2] * rhs[0] + lhs[6] * rhs[1] + lhs[10] * rhs[2] + lhs[14] * rhs[3],
  lhs[3] * rhs[0] + lhs[7] * rhs[1] + lhs[11] * rhs[2] + lhs[15] * rhs[3],
  lhs[0] * rhs[4] + lhs[4] * rhs[5] + lhs[8] * rhs[6] + lhs[12] * rhs[7],
  lhs[1] * rhs[4] + lhs[5] * rhs[5] + lhs[9] * rhs[6] + lhs[13] * rhs[7],
  lhs[2] * rhs[4] + lhs[6] * rhs[5] + lhs[10] * rhs[6] + lhs[14] * rhs[7],
  lhs[3] * rhs[4] + lhs[7] * rhs[5] + lhs[11] * rhs[6] + lhs[15] * rhs[7],
  lhs[0] * rhs[8] + lhs[4] * rhs[9] + lhs[8] * rhs[10] + lhs[12] * rhs[11],
  lhs[1] * rhs[8] + lhs[5] * rhs[9] + lhs[9] * rhs[10] + lhs[13] * rhs[11],
  lhs[2] * rhs[8] + lhs[6] * rhs[9] + lhs[10] * rhs[10] + lhs[14] * rhs[11],
  lhs[3] * rhs[8] + lhs[7] * rhs[9] + lhs[11] * rhs[10] + lhs[15] * rhs[11],
  lhs[0] * rhs[12] + lhs[4] * rhs[13] + lhs[8] * rhs[14] + lhs[12] * rhs[15],
  lhs[1] * rhs[12] + lhs[5] * rhs[13] + lhs[9] * rhs[14] + lhs[13] * rhs[15],
  lhs[2] * rhs[12] + lhs[6] * rhs[13] + lhs[10] * rhs[14] + lhs[14] * rhs[15],
  lhs[3] * rhs[12] + lhs[7] * rhs[13] + lhs[11] * rhs[14] + lhs[15] * rhs[15],
];

export const createViewMatrix = (
  position: Vector3,
  right: Vector3,
  up: Vector3,
  forward: Vector3,
): Matrix4 => [
  right[0],
  up[0],
  forward[0],
  0,
  right[1],
  up[1],
  forward[1],
  0,
  right[2],
  up[2],
  forward[2],
  0,
  -(right[0] * position[0] + right[1] * position[1] + right[2] * position[2]),
  -(up[0] * position[0] + up[1] * position[1] + up[2] * position[2]),
  -(forward[0] * position[0] + forward[1] * position[1] + forward[2] * position[2]),
  1,
];

export const createPerspectiveMatrix = (
  verticalFovRadians: number,
  aspectRatio: number,
  nearPlane: number,
  farPlane: number,
): Matrix4 => {
  const verticalScale = 1 / Math.tan(verticalFovRadians / 2);
  const depthScale = farPlane / (farPlane - nearPlane);

  return [
    verticalScale / aspectRatio,
    0,
    0,
    0,
    0,
    verticalScale,
    0,
    0,
    0,
    0,
    depthScale,
    1,
    0,
    0,
    -nearPlane * depthScale,
    0,
  ];
};

export const createOrthographicMatrix = (
  halfHeight: number,
  aspectRatio: number,
  nearPlane: number,
  farPlane: number,
): Matrix4 => {
  const verticalScale = 1 / halfHeight;
  const depthScale = 1 / (farPlane - nearPlane);

  return [
    verticalScale / aspectRatio,
    0,
    0,
    0,
    0,
    verticalScale,
    0,
    0,
    0,
    0,
    depthScale,
    0,
    0,
    0,
    -nearPlane * depthScale,
    1,
  ];
};
