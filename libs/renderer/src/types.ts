import { type Color, radians } from "@photon/core";
import { f32, pack, vec3f } from "./helpers/wgsl.ts";

export type Scene = {
  readonly depth: number;
  readonly voxels: Uint32Array;
  readonly materials: Float32Array;
  readonly emitters: Float32Array;
};

export type Sun = {
  readonly azimuthDegrees: number;
  readonly elevationDegrees: number;
  // Apparent angular radius of the sun.
  // 0 creates an infinitesimal directional light and hard shadows.
  // The real sun is about 0.27 degrees.
  // Larger values produce intentionally legible, stylized soft shadows.
  readonly angularRadiusDegrees: number;
  readonly intensity: number;
  readonly color: Color;
};

export type Sky = {
  readonly horizonColor: Color;
  readonly zenithColor: Color;
  readonly horizonFalloff: number;
};

export type Environment = {
  readonly sun: Sun;
  readonly sky: Sky;
};

export const createSunDirection = (
  azimuthDegrees: number,
  elevationDegrees: number,
): readonly [number, number, number] => {
  const azimuth = radians(azimuthDegrees);
  const elevation = radians(elevationDegrees);

  const horizontalLength = Math.cos(elevation);

  return [
    horizontalLength * Math.sin(azimuth),
    Math.sin(elevation),
    horizontalLength * Math.cos(azimuth),
  ];
};

export const createEnvironmentUniform = (environment: Environment): ArrayBuffer => {
  const sunDirection = createSunDirection(
    environment.sun.azimuthDegrees,
    environment.sun.elevationDegrees,
  );

  const sunAngularRadiusRadians = radians(environment.sun.angularRadiusDegrees);

  return pack(
    vec3f(sunDirection),
    f32(environment.sun.intensity),
    vec3f(environment.sun.color),
    f32(sunAngularRadiusRadians),
    vec3f(environment.sky.horizonColor),
    f32(environment.sky.horizonFalloff),
    vec3f(environment.sky.zenithColor),
  );
};
