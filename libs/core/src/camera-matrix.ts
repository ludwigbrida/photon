import { radians } from "./angle.ts";
import { createCameraBasis } from "./camera-basis.ts";
import { Projection, type Camera } from "./camera.ts";
import {
  createOrthographicMatrix,
  createPerspectiveMatrix,
  createViewMatrix,
  multiplyMatrix,
  type Matrix4,
} from "./matrix4.ts";

export const createCameraMatrix = (camera: Camera, aspectRatio: number): Matrix4 => {
  const { right, up, forward } = createCameraBasis(camera.direction, camera.up ?? [0, 1, 0]);

  const viewMatrix = createViewMatrix(camera.position, right, up, forward);

  const projectionMatrix =
    camera.projection === Projection.Perspective
      ? createPerspectiveMatrix(
          radians(camera.verticalFov),
          aspectRatio,
          camera.nearPlane,
          camera.farPlane,
        )
      : createOrthographicMatrix(
          camera.orthographicScale,
          aspectRatio,
          camera.nearPlane,
          camera.farPlane,
        );

  return multiplyMatrix(projectionMatrix, viewMatrix);
};
