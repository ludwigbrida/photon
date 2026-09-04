import { cross, normalize, type Vector3 } from "@photon/core";

export const createCameraBasis = (direction: Vector3, up: Vector3) => {
  // TODO: Handle a zero-length direction.
  const forward = normalize(direction);
  const normalizedUp = normalize(up);

  // TODO: Check that abs(dot(forward, normalizedUp)) is > certain threshold.
  // TODO: If the user chooses an up-vector parallel to forward, reject it, as their cross product
  // TODO: has no direction.
  const right = normalize(cross(forward, normalizedUp));

  // Re-compute up, so the three basis vectors are perfectly perpendicular.
  const newUp = cross(right, forward);

  return { right, up: newUp, forward };
};
