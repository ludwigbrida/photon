import type { ChunkKey, World } from "@photon/world";
import { createChunkMesh, type VoxelMesh } from "./mesh.ts";

export type GpuVoxelMesh = {
  readonly positionBuffer: GPUBuffer;
  readonly normalBuffer: GPUBuffer;
  readonly materialIndexBuffer: GPUBuffer;
  readonly indexBuffer: GPUBuffer;
  readonly indexCount: number;
  readonly destroy: () => void;
};

const createBuffer = (
  device: GPUDevice,
  label: string,
  data: Float32Array | Uint32Array,
  usage: GPUBufferUsageFlags,
): GPUBuffer => {
  // WebGPU buffers cannot have a zero size. Empty meshes still need buffers because the
  // render pipeline binds a consistent set of vertex streams before observing indexCount.
  const buffer = device.createBuffer({
    label,
    size: Math.max(data.byteLength, 4),
    usage,
  });

  if (data.byteLength > 0) {
    device.queue.writeBuffer(buffer, 0, data);
  }

  return buffer;
};

export const createGpuVoxelMesh = (device: GPUDevice, mesh: VoxelMesh): GpuVoxelMesh => {
  const positionBuffer = createBuffer(
    device,
    "voxelMeshPositionBuffer",
    mesh.positions,
    GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  );
  const normalBuffer = createBuffer(
    device,
    "voxelMeshNormalBuffer",
    mesh.normals,
    GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  );
  const materialIndexBuffer = createBuffer(
    device,
    "voxelMeshMaterialIndexBuffer",
    mesh.materialIndices,
    GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  );
  const indexBuffer = createBuffer(
    device,
    "voxelMeshIndexBuffer",
    mesh.indices,
    GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
  );

  return {
    positionBuffer,
    normalBuffer,
    materialIndexBuffer,
    indexBuffer,
    indexCount: mesh.indices.length,
    destroy: () => {
      positionBuffer.destroy();
      normalBuffer.destroy();
      materialIndexBuffer.destroy();
      indexBuffer.destroy();
    },
  };
};

export const createGpuChunkMesh = (
  device: GPUDevice,
  world: World,
  chunkKey: ChunkKey,
): GpuVoxelMesh => {
  return createGpuVoxelMesh(device, createChunkMesh(world, chunkKey));
};
