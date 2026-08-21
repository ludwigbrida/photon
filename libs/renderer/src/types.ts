import { cross, normalize, subtract, type Vector3 } from "@photon/core";

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

export const createCameraUniform = (camera: Camera): Float32Array => {
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

  // TODO: Should be implemented through an ArrayBuffer(64) and a Float32 and Uint32 view
  // TODO: as both types are mixed throughout this buffer.
  return new Float32Array([
    camera.position[0],
    camera.position[1],
    camera.position[2],
    cameraProjection[camera.projection],
    right[0],
    right[1],
    right[2],
    orthographicScale,
    up[0],
    up[1],
    up[2],
    verticalFov,
    forward[0],
    forward[1],
    forward[2],
    0,
  ]);
};

export type Sun = {
  readonly azimuthDegrees: number;
  readonly elevationDegrees: number;
  readonly intensity: number;
  readonly color: readonly [number, number, number];
};

export type Environment = {
  readonly sun: Sun;
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

export const createEnvironmentUniform = (environment: Environment): Float32Array => {
  const sunDirection = createSunDirection(
    environment.sun.azimuthDegrees,
    environment.sun.elevationDegrees,
  );

  return new Float32Array([
    sunDirection[0],
    sunDirection[1],
    sunDirection[2],
    environment.sun.intensity,
    environment.sun.color[0],
    environment.sun.color[1],
    environment.sun.color[2],
  ]);
};
