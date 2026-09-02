import { type RendererConfig } from "./config.ts";

export type RendererHandle = {
  readonly configure: (config: Partial<RendererConfig>) => void;
};
