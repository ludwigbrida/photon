import { type Color } from "@photon/core";

export type Material = {
  readonly color: Color;
};

export const material = ({ color }: Material): Material => ({
  color,
});
