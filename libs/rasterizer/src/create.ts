import type { Rasterizer, RasterizerConfig } from "./types.ts";

export const createRasterizer = (config: RasterizerConfig): Rasterizer => {
  return {
    render: (frame) => {
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

      renderPass.end();

      const commandBuffer = commandEncoder.finish({
        label: "rasterizerCommandBuffer",
      });

      config.device.queue.submit([commandBuffer]);
    },
  };
};
