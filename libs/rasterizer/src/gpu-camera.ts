import { createCameraMatrix, type Camera } from "@photon/core";

export type GpuCamera = {
  readonly buffer: GPUBuffer;
  readonly update: (camera: Camera, width: number, height: number) => void;
  readonly destroy: () => void;
};

export const createGpuCamera = (device: GPUDevice): GpuCamera => {
  const buffer = device.createBuffer({
    label: "rasterizerCameraBuffer",
    size: 16 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  return {
    buffer,
    update: (camera, width, height) => {
      const matrix = createCameraMatrix(camera, width / height);
      device.queue.writeBuffer(buffer, 0, new Float32Array(matrix));
    },
    destroy: () => {
      buffer.destroy();
    },
  };
};
