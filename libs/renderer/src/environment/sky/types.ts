import type { Color } from "@photon/core";

export type Sky = {
  readonly horizonColor: Color;
  readonly zenithColor: Color;
  readonly horizonFalloff: number;
};
