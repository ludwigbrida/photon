import { cube, material, move, pipe, union } from "@photon/author";
import { Projection, type Camera, type Environment } from "@photon/renderer";

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

const scene = union(
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
      material: white,
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

const camera: Camera = {
  projection: Projection.Perspective,
  position: [0, 1, -32],
  direction: [0, 0, 1],
  verticalFov: 60,
};

const environment: Environment = {
  sun: {
    azimuthDegrees: 35,
    elevationDegrees: 45,
    angularRadiusDegrees: 5,
    intensity: 5,
    color: [1, 0.98, 0.92],
  },
  sky: {
    horizonColor: [0.65, 0.78, 1],
    zenithColor: [0.08, 0.28, 0.72],
    horizonFalloff: 1.4,
  },
};

export default {
  scene,
  camera,
  environment,
};
