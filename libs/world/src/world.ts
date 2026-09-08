import type { Chunk, ChunkKey } from "./chunk.ts";
import type { Material } from "./material.ts";

export type World = {
  // The palette is append-only for now, so cells can refer to entries by their stable array index.
  readonly materials: readonly Material[];
  readonly chunks: ReadonlyMap<ChunkKey, Chunk>;
};

export const createWorld = (): World => ({
  materials: [],
  chunks: new Map(),
});
