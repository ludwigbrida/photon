import { radians } from "@photon/core";
import { f32, pack, vec3f } from "../helpers/wgsl.ts";
import { createSunDirection } from "./sun/direction.ts";
import type { Environment } from "./types.ts";

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
