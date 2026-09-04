import type { RendererConfig } from "./config.ts";

export type RendererHandle = {
  readonly configure: (config: Partial<RendererConfig>) => void;
  readonly reset: () => void;
  readonly start: () => void;
  readonly stop: () => void;
};
