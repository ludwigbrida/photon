import type { Vector3 } from "@photon/core";
import {
  CHUNK_SIZE,
  createChunkKey,
  getChunkVoxelValue,
  type Chunk,
  type ChunkKey,
} from "./chunk.ts";
import type { Material } from "./material.ts";
import { EMPTY_VOXEL_VALUE, type VoxelValue } from "./voxel.ts";

export type World = {
  // The palette is append-only for now, so cells can refer to entries by their stable array index.
  readonly materials: readonly Material[];
  readonly chunks: ReadonlyMap<ChunkKey, Chunk>;
};

export const createWorld = (): World => {
  return {
    materials: [],
    chunks: new Map(),
  };
};

const getWorldChunkCoordinates = (worldPosition: Vector3): Vector3 => {
  return [
    Math.floor(worldPosition[0] / CHUNK_SIZE),
    Math.floor(worldPosition[1] / CHUNK_SIZE),
    Math.floor(worldPosition[2] / CHUNK_SIZE),
  ];
};

const getLocalPosition = (worldPosition: Vector3, chunkCoordinates: Vector3): Vector3 => {
  return [
    worldPosition[0] - chunkCoordinates[0] * CHUNK_SIZE,
    worldPosition[1] - chunkCoordinates[1] * CHUNK_SIZE,
    worldPosition[2] - chunkCoordinates[2] * CHUNK_SIZE,
  ];
};

export const getWorldVoxelValue = (world: World, worldPosition: Vector3): VoxelValue => {
  const chunkCoordinates = getWorldChunkCoordinates(worldPosition);
  const chunk = world.chunks.get(createChunkKey(chunkCoordinates));

  if (chunk === undefined) {
    return EMPTY_VOXEL_VALUE;
  }

  return getChunkVoxelValue(chunk, getLocalPosition(worldPosition, chunkCoordinates));
};
