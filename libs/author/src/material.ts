import { type Color } from "@photon/core";

export type Emission = {
  readonly color: Color;
  readonly strength: number;
};

export type Material = {
  readonly color: Color;
  readonly emission?: Emission;
};

export const material = ({ color, emission }: Material): Material => ({
  color,
  emission,
});
