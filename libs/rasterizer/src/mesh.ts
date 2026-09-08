import { add, scale, type Vector3 } from "@photon/core";
import {
  CHUNK_SIZE,
  EMPTY_VOXEL_VALUE,
  decodeMaterialIndex,
  getChunkCoordinates,
  getChunkVoxelValue,
  getWorldVoxelValue,
  type ChunkKey,
  type MaterialIndex,
  type World,
} from "@photon/world";

type Face = {
  readonly normal: Vector3;
  readonly neighborOffset: Vector3;
  readonly vertices: readonly [Vector3, Vector3, Vector3, Vector3];
};

const FACES: readonly Face[] = [
  {
    normal: [1, 0, 0],
    neighborOffset: [1, 0, 0],
    vertices: [
      [1, 0, 0],
      [1, 1, 0],
      [1, 1, 1],
      [1, 0, 1],
    ],
  },
  {
    normal: [-1, 0, 0],
    neighborOffset: [-1, 0, 0],
    vertices: [
      [0, 0, 0],
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
  },
  {
    normal: [0, 1, 0],
    neighborOffset: [0, 1, 0],
    vertices: [
      [0, 1, 0],
      [0, 1, 1],
      [1, 1, 1],
      [1, 1, 0],
    ],
  },
  {
    normal: [0, -1, 0],
    neighborOffset: [0, -1, 0],
    vertices: [
      [0, 0, 0],
      [1, 0, 0],
      [1, 0, 1],
      [0, 0, 1],
    ],
  },
  {
    normal: [0, 0, 1],
    neighborOffset: [0, 0, 1],
    vertices: [
      [0, 0, 1],
      [1, 0, 1],
      [1, 1, 1],
      [0, 1, 1],
    ],
  },
  {
    normal: [0, 0, -1],
    neighborOffset: [0, 0, -1],
    vertices: [
      [0, 0, 0],
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
    ],
  },
];

export type VoxelMesh = {
  readonly positions: Float32Array;
  readonly normals: Float32Array;
  readonly materialIndices: Uint32Array;
  readonly indices: Uint32Array;
};

const createEmptyMesh = (): VoxelMesh => ({
  positions: new Float32Array(),
  normals: new Float32Array(),
  materialIndices: new Uint32Array(),
  indices: new Uint32Array(),
});

const addFace = (
  positions: number[],
  normals: number[],
  materialIndices: number[],
  indices: number[],
  voxelPosition: Vector3,
  face: Face,
  materialIndex: MaterialIndex,
) => {
  const vertexOffset = positions.length / 3;

  for (const vertex of face.vertices) {
    const position = add(voxelPosition, vertex);
    positions.push(position[0], position[1], position[2]);
    normals.push(face.normal[0], face.normal[1], face.normal[2]);
    materialIndices.push(materialIndex);
  }

  indices.push(
    vertexOffset,
    vertexOffset + 1,
    vertexOffset + 2,
    vertexOffset,
    vertexOffset + 2,
    vertexOffset + 3,
  );
};

export const createChunkMesh = (world: World, chunkKey: ChunkKey): VoxelMesh => {
  const chunk = world.chunks.get(chunkKey);

  if (chunk === undefined) {
    return createEmptyMesh();
  }

  const positions: number[] = [];
  const normals: number[] = [];
  const materialIndices: number[] = [];
  const indices: number[] = [];
  const chunkOrigin = scale(getChunkCoordinates(chunkKey), CHUNK_SIZE);

  for (let z = 0; z < CHUNK_SIZE; z++) {
    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const localPosition: Vector3 = [x, y, z];
        const materialIndex = decodeMaterialIndex(getChunkVoxelValue(chunk, localPosition));

        if (materialIndex === undefined) {
          continue;
        }

        const voxelPosition = add(chunkOrigin, localPosition);

        for (const face of FACES) {
          // World-space reads make faces on chunk boundaries disappear when an adjacent chunk is full.
          if (
            getWorldVoxelValue(world, add(voxelPosition, face.neighborOffset)) !== EMPTY_VOXEL_VALUE
          ) {
            continue;
          }

          addFace(positions, normals, materialIndices, indices, voxelPosition, face, materialIndex);
        }
      }
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    materialIndices: new Uint32Array(materialIndices),
    indices: new Uint32Array(indices),
  };
};
