import type { Vector3 } from "@photon/core";

export const Projection = {
  Orthographic: 0,
  Perspective: 1,
} as const;

export type Projection = (typeof Projection)[keyof typeof Projection];

type CameraTransform = {
  readonly position: Vector3;
  readonly direction: Vector3;
  readonly up?: Vector3;
};

type OrthographicCamera = CameraTransform & {
  readonly projection: typeof Projection.Orthographic;
  readonly orthographicScale: number;
};

type PerspectiveCamera = CameraTransform & {
  readonly projection: typeof Projection.Perspective;
  readonly verticalFov: number;
};

export type Camera = OrthographicCamera | PerspectiveCamera;
