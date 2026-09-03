import { cube, material, move, pipe, pyramid, union } from "@photon/author";
import { Projection } from "@photon/renderer";

const white = material({
  color: [1, 1, 1],
});

const warmLight = material({
  color: [1, 0.22, 0.03],
  emission: {
    color: [1, 0.16, 0.015],
    strength: 20,
  },
});

const mirror = material({
  color: [1, 1, 1],
  metallic: 1,
});

const blue = material({
  color: [0.1, 0.3, 1],
});

export const example = union(
  pyramid({
    height: 10,
    material: white,
  }),
  pipe(
    cube({
      size: [3, 1, 1],
      material: warmLight,
    }),
    move([-1, 3, -6]),
  ),
  pipe(
    cube({
      size: [1, 3, 5],
      material: mirror,
    }),
    move([6, 4, -1]),
  ),
  pipe(
    cube({
      size: [1, 5, 1],
      material: blue,
    }),
    move([9, 1, 3]),
  ),
);

export const exampleCamera = {
  projection: Projection.Orthographic,
  position: [256.5, 256.5, -257.5],
  target: [0.5, 0.5, 0.5],
  orthographicScale: 12,
} as const;
