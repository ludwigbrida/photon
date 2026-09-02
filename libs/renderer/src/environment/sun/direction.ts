import { radians, type Vector3 } from "@photon/core";

export const createSunDirection = (azimuthDegrees: number, elevationDegrees: number): Vector3 => {
  const azimuth = radians(azimuthDegrees);
  const elevation = radians(elevationDegrees);

  const horizontalLength = Math.cos(elevation);

  return [
    horizontalLength * Math.sin(azimuth),
    Math.sin(elevation),
    horizontalLength * Math.cos(azimuth),
  ];
};
