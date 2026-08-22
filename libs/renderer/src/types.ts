import { Color, cross, normalize, subtract, type Vector3 } from "@photon/core";
import { f32, pack, u32, vec3f } from "./helpers/wgsl.ts";

export type Scene = {
  readonly depth: number;
  readonly voxels: Uint32Array;
  readonly materials: Float32Array;
};

export type CameraTransform = {
  readonly position: Vector3;
  readonly target: Vector3;
  readonly up?: Vector3;
};

export type PerspectiveCamera = CameraTransform & {
  readonly projection: "perspective";
  readonly verticalFov: number;
};

export type OrthographicCamera = CameraTransform & {
  readonly projection: "orthographic";
  readonly orthographicScale: number;
};

export type Camera = PerspectiveCamera | OrthographicCamera;

const cameraProjection = {
  orthographic: 0,
  perspective: 1,
} as const;

const DEFAULT_CAMERA_UP: Vector3 = [0, 1, 0];

const createCameraBasis = (position: Vector3, target: Vector3, up: Vector3) => {
  // TODO: Handle zero-length (camera target must differ from position)
  const forward = normalize(subtract(target, position));
  const normalizedUp = normalize(up);

  // TODO: Check that abs(dot(forward, normalizedUp)) is > certain threshold.
  // TODO: If the user chooses an up-vector parallel to forward, reject it, as their cross product
  // TODO: has no direction.
  const right = normalize(cross(forward, normalizedUp));

  // Re-compute up, so the three basis vectors are perfectly perpendicular.
  const newUp = cross(right, forward);

  return { right, up: newUp, forward };
};

export const createCameraUniform = (camera: Camera): ArrayBuffer => {
  const { right, up, forward } = createCameraBasis(
    camera.position,
    camera.target,
    camera.up ?? DEFAULT_CAMERA_UP,
  );

  const orthographicScale = camera.projection === "orthographic" ? camera.orthographicScale : 0;

  const verticalFov =
    camera.projection === "perspective" ? degreesToRadians(camera.verticalFov) : 0;

  // TODO: Check that verticalFov is between 0 and 180 degrees.
  // TODO: Check that orthographicScale is greater than 0.

  return pack(
    vec3f(camera.position),
    u32(cameraProjection[camera.projection]),
    vec3f(right),
    f32(orthographicScale),
    vec3f(up),
    f32(verticalFov),
    vec3f(forward),
  );
};

export type Sun = {
  readonly azimuthDegrees: number;
  readonly elevationDegrees: number;
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

const degreesToRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

export const createSunDirection = (
  azimuthDegrees: number,
  elevationDegrees: number,
): readonly [number, number, number] => {
  const azimuth = degreesToRadians(azimuthDegrees);
  const elevation = degreesToRadians(elevationDegrees);

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

  return pack(
    vec3f(sunDirection),
    f32(environment.sun.intensity),
    vec3f(environment.sun.color),
    vec3f(environment.sky.horizonColor),
    f32(environment.sky.horizonFalloff),
    vec3f(environment.sky.zenithColor),
  );
};
