import type { Sky } from "./sky/types.ts";
import type { Sun } from "./sun/types.ts";

export type Environment = {
  readonly sun: Sun;
  readonly sky: Sky;
};
