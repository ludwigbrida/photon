import { cube, material, move, pipe, pyramid, union } from "@photon/author";
import { type Camera, Projection } from "@photon/core";
import type { Environment } from "@photon/renderer";
import { addWorldMaterial, applyVoxelEdits, createWorld, encodeMaterialIndex } from "@photon/world";

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

const addedWorldMaterial = addWorldMaterial(createWorld(), { color: [0.2, 0.6, 1], metallic: 0 });

const world = applyVoxelEdits(addedWorldMaterial.world, [
  {
    position: [0, 0, 0],
    value: encodeMaterialIndex(addedWorldMaterial.materialIndex),
  },
]);

const scene = union(
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

const camera: Camera = {
  projection: Projection.Orthographic,
  position: [256.5, 256.5, -257.5],
  direction: [-0.5758468, -0.5758468, 0.5803456],
  nearPlane: 0.1,
  farPlane: 10_000,
  orthographicScale: 12,
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
  world,
  camera,
  environment,
};
