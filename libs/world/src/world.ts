import type { Chunk, ChunkKey } from "./chunk.ts";
import type { Material } from "./material.ts";

export type World = {
  readonly materials: readonly Material[];
  readonly chunks: ReadonlyMap<ChunkKey, Chunk>;
};
