import type { Color } from "@photon/core";

export type Sun = {
  readonly azimuthDegrees: number;
  readonly elevationDegrees: number;
  // Apparent angular radius of the sun.
  // 0 creates an infinitesimal directional light and hard shadows.
  // The real sun is about 0.27 degrees.
  // Larger values produce intentionally legible, stylized soft shadows.
  readonly angularRadiusDegrees: number;
  readonly intensity: number;
  readonly color: Color;
};
