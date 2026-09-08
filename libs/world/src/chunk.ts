import type { Vector3 } from "@photon/core";

export const CHUNK_SIZE = 16;
export const CHUNK_VOLUME = CHUNK_SIZE ** 3;

declare const chunkKeyBrand: unique symbol;

export type ChunkKey = string & {
  readonly [chunkKeyBrand]: true;
};

export const createChunkKey = (coordinates: Vector3): ChunkKey => {
  return coordinates.join(",") as ChunkKey;
};

export const getChunkCoordinates = (key: ChunkKey): Vector3 => {
  const [x, y, z] = key.split(",").map(Number);
  return [x, y, z];
};

export type Chunk = {
  // 0 represents an empty cell. Filled cells store their material index plus 1.
  readonly voxels: Uint16Array;
};

export const createChunk = (): Chunk => {
  return {
    voxels: new Uint16Array(CHUNK_VOLUME),
  };
};

export const getChunkVoxelIndex = (localPosition: Vector3): number => {
  return localPosition[0] + localPosition[1] * CHUNK_SIZE + localPosition[2] * CHUNK_SIZE ** 2;
};
