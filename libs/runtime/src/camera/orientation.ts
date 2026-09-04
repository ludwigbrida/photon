import type { Vector3 } from "@photon/core";

export type CameraYawPitch = {
  readonly yawRadians: number;
  readonly pitchRadians: number;
};

const HALF_PI = Math.PI / 2;
const PITCH_MARGIN_RADIANS = 0.0001;

export const MAX_PITCH_RADIANS = HALF_PI - PITCH_MARGIN_RADIANS;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

export const directionFromYawPitch = ({ yawRadians, pitchRadians }: CameraYawPitch): Vector3 => {
  // todo: validate yaw and pitch as finite values

  const pitch = clamp(pitchRadians, -MAX_PITCH_RADIANS, MAX_PITCH_RADIANS);
  const horizontalMagnitude = Math.cos(pitch);

  return [
    Math.sin(yawRadians) * horizontalMagnitude,
    Math.sin(pitch),
    Math.cos(yawRadians) * horizontalMagnitude,
  ];
};

export const yawPitchFromDirection = (direction: Vector3): CameraYawPitch => {
  const length = Math.hypot(direction[0], direction[1], direction[2]);

  // todo: validate direction as a finite, non-zero vector

  const x = direction[0] / length;
  const y = direction[1] / length;
  const z = direction[2] / length;

  return {
    yawRadians: Math.atan2(x, z),
    pitchRadians: clamp(Math.asin(clamp(y, -1, 1)), -MAX_PITCH_RADIANS, MAX_PITCH_RADIANS),
  };
};
