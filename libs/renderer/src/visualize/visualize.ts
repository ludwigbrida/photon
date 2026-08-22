import visualizeShader from "./visualize.wgsl?raw";

export const createVisualizePass = (
  device: GPUDevice,
  context: GPUCanvasContext,
  accumulationViewA: GPUTextureView,
  accumulationViewB: GPUTextureView,
) => {
  const shaderModule = device.createShaderModule({
    label: "visualizeShaderModule",
    code: visualizeShader,
  });

  const accumulationBindGroupLayout = device.createBindGroupLayout({
    label: "visualizeAccumulationBindGroupLayout",
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        texture: {
          sampleType: "unfilterable-float",
        },
      },
    ],
  });

  const accumulationBindGroups = [
    device.createBindGroup({
      label: "visualizeAccumulationBindGroupA",
      layout: accumulationBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: accumulationViewB,
        },
      ],
    }),
    device.createBindGroup({
      label: "visualizeAccumulationBindGroupB",
      layout: accumulationBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: accumulationViewA,
        },
      ],
    }),
  ] as const;

  const pipelineLayout = device.createPipelineLayout({
    label: "visualizePipelineLayout",
    bindGroupLayouts: [accumulationBindGroupLayout],
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

  const run = (commandEncoder: GPUCommandEncoder, sample: number) => {
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
    passEncoder.setBindGroup(0, accumulationBindGroups[sample % 2]);
    passEncoder.draw(6);
    passEncoder.end();
  };

  return {
    run,
  };
};
