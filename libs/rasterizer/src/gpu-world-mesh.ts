import { add, type Vector3 } from "@photon/core";
import {
  createChunkKey,
  getChunkCoordinates,
  type Chunk,
  type ChunkKey,
  type World,
} from "@photon/world";
import { createGpuChunkMesh, type GpuVoxelMesh } from "./gpu-mesh.ts";

type CachedChunkMesh = {
  readonly chunk: Chunk;
  readonly mesh: GpuVoxelMesh;
};

export type GpuWorldMeshCache = {
  readonly update: (world: World) => ReadonlyMap<ChunkKey, GpuVoxelMesh>;
  readonly destroy: () => void;
};

const NEIGHBOR_OFFSETS: readonly Vector3[] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];

const addChunkAndNeighbors = (chunkKeys: Set<ChunkKey>, chunkKey: ChunkKey) => {
  chunkKeys.add(chunkKey);

  const coordinates = getChunkCoordinates(chunkKey);

  for (const offset of NEIGHBOR_OFFSETS) {
    chunkKeys.add(createChunkKey(add(coordinates, offset)));
  }
};

export const createGpuWorldMeshCache = (device: GPUDevice): GpuWorldMeshCache => {
  const cachedChunkMeshes = new Map<ChunkKey, CachedChunkMesh>();
  const meshes = new Map<ChunkKey, GpuVoxelMesh>();

  return {
    update: (world) => {
      const dirtyChunkKeys = new Set<ChunkKey>();

      for (const [chunkKey, chunk] of world.chunks) {
        if (cachedChunkMeshes.get(chunkKey)?.chunk !== chunk) {
          // TODO: Change this behavior once chunks are mutable.
          // Chunks are immutable snapshots: replacing a chunk identifies an edit. The affected
          // chunk and its neighbors must be remeshed because voxel faces span chunk boundaries.
          addChunkAndNeighbors(dirtyChunkKeys, chunkKey);
        }
      }

      for (const chunkKey of cachedChunkMeshes.keys()) {
        if (!world.chunks.has(chunkKey)) {
          addChunkAndNeighbors(dirtyChunkKeys, chunkKey);
        }
      }

      for (const chunkKey of dirtyChunkKeys) {
        const cachedChunkMesh = cachedChunkMeshes.get(chunkKey);
        const chunk = world.chunks.get(chunkKey);

        if (chunk === undefined) {
          cachedChunkMesh?.mesh.destroy();
          cachedChunkMeshes.delete(chunkKey);
          meshes.delete(chunkKey);
          continue;
        }

        cachedChunkMesh?.mesh.destroy();

        const mesh = createGpuChunkMesh(device, world, chunkKey);
        cachedChunkMeshes.set(chunkKey, { chunk, mesh });
        meshes.set(chunkKey, mesh);
      }

      return meshes;
    },
    destroy: () => {
      for (const { mesh } of cachedChunkMeshes.values()) {
        mesh.destroy();
      }

      cachedChunkMeshes.clear();
      meshes.clear();
    },
  };
};
