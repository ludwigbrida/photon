import type { Vector3 } from "./vector3.ts";

export const Projection = {
  Orthographic: 0,
  Perspective: 1,
} as const;

export type Projection = (typeof Projection)[keyof typeof Projection];

type CameraTransform = {
  readonly position: Vector3;
  readonly direction: Vector3;
  readonly up?: Vector3;
  /**
   * The nearest visible distance from the camera, in world-space units.
   * It must be greater than zero and less than farPlane.
   */
  readonly nearPlane: number;
  /**
   * The farthest visible distance from the camera, in world-space units.
   * It must be greater than nearPlane.
   */
  readonly farPlane: number;
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
