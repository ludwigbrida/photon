import visualizeShader from "./visualize.wgsl?raw";

export const createVisualizePass = (
  device: GPUDevice,
  context: GPUCanvasContext,
  presentationTexture: GPUTextureView,
) => {
  const shaderModule = device.createShaderModule({
    label: "visualizeShaderModule",
    code: visualizeShader,
  });

  const presentationBindGroupLayout = device.createBindGroupLayout({
    label: "visualizePresentationBindGroupLayout",
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        texture: {
          sampleType: "float",
        },
      },
    ],
  });

  const presentationBindGroup = device.createBindGroup({
    label: "visualizePresentationBindGroup",
    layout: presentationBindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: presentationTexture,
      },
    ],
  });

  const pipelineLayout = device.createPipelineLayout({
    label: "visualizePipelineLayout",
    bindGroupLayouts: [presentationBindGroupLayout],
  });

  const pipeline = device.createRenderPipeline({
    label: "visualizePipeline",
    layout: pipelineLayout,
    vertex: {
      module: shaderModule,
      entryPoint: "vertexMain",
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fragmentMain",
      targets: [
        {
          format: context.getCurrentTexture().format,
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
    },
  });

  const run = (commandEncoder: GPUCommandEncoder) => {
    const canvasTextureView = context.getCurrentTexture().createView({
      label: "canvasTextureView",
    });

    const passEncoder = commandEncoder.beginRenderPass({
      label: "visualizePassEncoder",
      colorAttachments: [
        {
          view: canvasTextureView,
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, presentationBindGroup);
    passEncoder.draw(6);
    passEncoder.end();
  };

  return {
    run,
  };
};
