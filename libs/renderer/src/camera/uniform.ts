import { radians } from "@photon/core";
import { f32, pack, u32, vec3f } from "../helpers/wgsl.ts";
import { createCameraBasis } from "./basis.ts";
import { type Camera, Projection } from "./types.ts";

export const createCameraUniform = (camera: Camera): ArrayBuffer => {
  const { right, up, forward } = createCameraBasis(camera.direction, camera.up ?? [0, 1, 0]);

  const orthographicScale =
    camera.projection === Projection.Orthographic ? camera.orthographicScale : 0;

  const verticalFov =
    camera.projection === Projection.Perspective ? radians(camera.verticalFov) : 0;

  // TODO: Check that verticalFov is between 0 and 180 degrees.
  // TODO: Check that orthographicScale is greater than 0.

  return pack(
    vec3f(camera.position),
    u32(camera.projection),
    vec3f(right),
    f32(orthographicScale),
    vec3f(up),
    f32(verticalFov),
    vec3f(forward),
  );
};
