import { type Color } from "@photon/core";

type Emission = {
  readonly color: Color;
  readonly strength: number;
};

export type MaterialOptions = {
  readonly color: Color;
  // TODO: add explicit sampling of emissive voxels
  // their light should reach surfaces reliably rather than only when a random bounce hits them
  readonly emission?: Emission;
  // Blend between diffuse and ideal metallic reflection.
  // 0 creates a Lambert diffuse material.
  // 1 creates a perfectly smooth metallic reflector.
  readonly metallic?: number;
};

export type Material = {
  readonly color: Color;
  readonly emission?: Emission;
  readonly metallic: number;
};

export const material = ({ color, emission, metallic = 0 }: MaterialOptions): Material => ({
  color,
  emission,
  metallic,
});
