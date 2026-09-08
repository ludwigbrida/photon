import type { Color } from "@photon/core";

export type MaterialId = number;

export type Material = {
  readonly color: Color;
  readonly emission?: {
    readonly color: Color;
    readonly strength: number;
  };
  readonly metallic: number;
};
