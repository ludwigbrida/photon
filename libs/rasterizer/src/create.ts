import { createGpuCamera } from "./gpu-camera.ts";
import { createGpuWorldMeshCache } from "./gpu-world-mesh.ts";
import { createRasterizePipeline } from "./pipeline.ts";
import type { Rasterizer, RasterizerConfig } from "./types.ts";

export const createRasterizer = (config: RasterizerConfig): Rasterizer => {
  const gpuCamera = createGpuCamera(config.device);
  const meshCache = createGpuWorldMeshCache(config.device);
  const { pipeline, cameraBindGroupLayout } = createRasterizePipeline(config);

  const cameraBindGroup = config.device.createBindGroup({
    label: "rasterizerCameraBindGroup",
    layout: cameraBindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: { buffer: gpuCamera.buffer },
      },
    ],
  });

  return {
    render: (frame) => {
      gpuCamera.update(frame.camera, frame.width, frame.height);

      const meshes = meshCache.update(frame.world);

      const commandEncoder = config.device.createCommandEncoder({
        label: "rasterizerCommandEncoder",
      });

      const renderPass = commandEncoder.beginRenderPass({
        label: "rasterizerRenderPass",
        colorAttachments: [
          {
            view: frame.colorTarget,
            clearValue: [0, 0, 0, 1],
            loadOp: "clear",
            storeOp: "store",
          },
        ],
        depthStencilAttachment: {
          view: frame.depthTarget,
          depthClearValue: 1,
          depthLoadOp: "clear",
          depthStoreOp: "store",
        },
      });

      renderPass.setPipeline(pipeline);
      renderPass.setBindGroup(0, cameraBindGroup);

      for (const mesh of meshes.values()) {
        renderPass.setVertexBuffer(0, mesh.positionBuffer);
        renderPass.setVertexBuffer(1, mesh.normalBuffer);
        renderPass.setVertexBuffer(2, mesh.materialIndexBuffer);
        renderPass.setIndexBuffer(mesh.indexBuffer, "uint32");
        renderPass.drawIndexed(mesh.indexCount);
      }

      renderPass.end();

      const commandBuffer = commandEncoder.finish({
        label: "rasterizerCommandBuffer",
      });

      config.device.queue.submit([commandBuffer]);
    },
    destroy: () => {
      meshCache.destroy();
      gpuCamera.destroy();
    },
  };
};
