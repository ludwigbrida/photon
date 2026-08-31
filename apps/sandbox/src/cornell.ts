import { cube, material, move, pipe, union } from "@photon/author";

const white = material({
  color: [0.8, 0.8, 0.8],
});

const red = material({
  color: [0.8, 0.05, 0.05],
});

const green = material({
  color: [0.05, 0.8, 0.1],
});

const light = material({
  color: [1, 0.9, 0.7],
  emission: {
    color: [1, 0.9, 0.7],
    strength: 15,
  },
});

const mirror = material({
  color: [1, 1, 1],
  metallic: 1,
});

export const cornell = union(
  // Floor
  pipe(
    cube({
      size: [20, 1, 20],
      material: white,
    }),
    move([-10, -10, -10]),
  ),

  // Ceiling
  pipe(
    cube({
      size: [20, 1, 20],
      material: white,
    }),
    move([-10, 10, -10]),
  ),

  // Back wall
  pipe(
    cube({
      size: [20, 20, 1],
      material: mirror,
    }),
    move([-10, -10, 9]),
  ),

  // Left wall
  pipe(
    cube({
      size: [1, 20, 20],
      material: red,
    }),
    move([-10, -10, -10]),
  ),

  // Right wall
  pipe(
    cube({
      size: [1, 20, 20],
      material: green,
    }),
    move([9, -10, -10]),
  ),

  // Ceiling panel
  pipe(
    cube({
      size: [6, 1, 6],
      material: light,
    }),
    move([-3, 9, -3]),
  ),

  // Left block
  pipe(
    cube({
      size: [4, 4, 4],
      material: white,
    }),
    move([3, -9, -3]),
  ),

  // Right block
  pipe(
    cube({
      size: [5, 7, 5],
      material: white,
    }),
    move([-7, -9, 1]),
  ),
);

export const cornellCamera = {
  projection: "perspective",
  position: [0, 0, -21],
  target: [0, 0, 0],
  verticalFov: 60,
} as const;
