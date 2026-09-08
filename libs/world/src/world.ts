import { divide, floor, scale, subtract, type Vector3 } from "@photon/core";
import {
  CHUNK_SIZE,
  createChunk,
  createChunkKey,
  getChunkVoxelIndex,
  getChunkVoxelValue,
  type Chunk,
  type ChunkKey,
} from "./chunk.ts";
import type { Material, MaterialIndex } from "./material.ts";
import { EMPTY_VOXEL_VALUE, MAX_MATERIAL_COUNT, type VoxelValue } from "./voxel.ts";

export type World = {
  // The palette is append-only for now, so cells can refer to entries by their stable array index.
  readonly materials: readonly Material[];
  readonly chunks: ReadonlyMap<ChunkKey, Chunk>;
};

export type VoxelEdit = {
  // Must be an integer world voxel position.
  readonly position: Vector3;
  // 0 clears the cell. Filled values reference a material palette index plus 1.
  readonly value: VoxelValue;
};

export type AddedMaterial = {
  readonly world: World;
  readonly materialIndex: MaterialIndex;
};

export const createWorld = (): World => {
  return {
    materials: [],
    chunks: new Map(),
  };
};

export const addWorldMaterial = (world: World, material: Material): AddedMaterial => {
  if (world.materials.length >= MAX_MATERIAL_COUNT) {
    throw new Error(`Worlds can contain at most ${MAX_MATERIAL_COUNT} materials.`);
  }

  const materialIndex = world.materials.length;

  return {
    world: {
      ...world,
      materials: [...world.materials, material],
    },
    materialIndex,
  };
};

const getWorldChunkCoordinates = (worldPosition: Vector3): Vector3 => {
  return floor(divide(worldPosition, CHUNK_SIZE));
};

const getLocalPosition = (worldPosition: Vector3, chunkCoordinates: Vector3): Vector3 => {
  return subtract(worldPosition, scale(chunkCoordinates, CHUNK_SIZE));
};

export const getWorldVoxelValue = (world: World, worldPosition: Vector3): VoxelValue => {
  const chunkCoordinates = getWorldChunkCoordinates(worldPosition);
  const chunk = world.chunks.get(createChunkKey(chunkCoordinates));

  if (chunk === undefined) {
    return EMPTY_VOXEL_VALUE;
  }

  return getChunkVoxelValue(chunk, getLocalPosition(worldPosition, chunkCoordinates));
};

const cloneChunk = (chunk: Chunk): Chunk => {
  return {
    voxels: chunk.voxels.slice(),
  };
};

// Edits are applied in order, so later edits to the same position win.
// TODO: Validate voxel values and material references at editor and persistence boundaries.
export const applyVoxelEdits = (world: World, edits: readonly VoxelEdit[]): World => {
  // Holds transaction-owned chunks. A touched existing chunk is copied only on its first edit.
  const changedChunks = new Map<ChunkKey, Chunk>();

  for (const { position, value } of edits) {
    const chunkCoordinates = getWorldChunkCoordinates(position);
    const chunkKey = createChunkKey(chunkCoordinates);
    const localPosition = getLocalPosition(position, chunkCoordinates);
    let chunk = changedChunks.get(chunkKey);

    if (chunk === undefined) {
      const existingChunk = world.chunks.get(chunkKey);

      if (existingChunk === undefined) {
        // Clearing an already-empty position does not allocate a chunk.
        if (value === EMPTY_VOXEL_VALUE) {
          continue;
        }

        chunk = createChunk();
      } else {
        if (getChunkVoxelValue(existingChunk, localPosition) === value) {
          continue;
        }

        chunk = cloneChunk(existingChunk);
      }

      changedChunks.set(chunkKey, chunk);
    }

    chunk.voxels[getChunkVoxelIndex(localPosition)] = value;
  }

  if (changedChunks.size === 0) {
    return world;
  }

  // TODO: Replace this full map copy if profiling shows it is costly for large worlds.
  const chunks = new Map(world.chunks);

  for (const [chunkKey, chunk] of changedChunks) {
    // TODO: Track occupied cell counts and remove chunks that become empty.
    chunks.set(chunkKey, chunk);
  }

  return { ...world, chunks };
};
