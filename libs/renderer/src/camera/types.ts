import type { Vector3 } from "@photon/core";

export const Projection = {
  Orthographic: 0,
  Perspective: 1,
} as const;

export type Projection = (typeof Projection)[keyof typeof Projection];

export type CameraTransform = {
  readonly position: Vector3;
  readonly target: Vector3;
  readonly up?: Vector3;
};

export type OrthographicCamera = CameraTransform & {
  readonly projection: typeof Projection.Orthographic;
  readonly orthographicScale: number;
};

export type PerspectiveCamera = CameraTransform & {
  readonly projection: typeof Projection.Perspective;
  readonly verticalFov: number;
};

export type Camera = OrthographicCamera | PerspectiveCamera;
