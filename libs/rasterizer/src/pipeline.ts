import rasterizeShader from "./rasterize.wgsl?raw";
import type { RasterizerConfig } from "./types.ts";

export type RasterizePipeline = {
  readonly pipeline: GPURenderPipeline;
  readonly cameraBindGroupLayout: GPUBindGroupLayout;
};

export const createRasterizePipeline = ({
  device,
  colorFormat,
  depthFormat,
}: RasterizerConfig): RasterizePipeline => {
  const shaderModule = device.createShaderModule({
    label: "rasterizerShaderModule",
    code: rasterizeShader,
  });

  const cameraBindGroupLayout = device.createBindGroupLayout({
    label: "rasterizerCameraBindGroupLayout",
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: {
          type: "uniform",
        },
      },
    ],
  });

  const pipelineLayout = device.createPipelineLayout({
    label: "rasterizerPipelineLayout",
    bindGroupLayouts: [cameraBindGroupLayout],
  });

  const pipeline = device.createRenderPipeline({
    label: "rasterizerPipeline",
    layout: pipelineLayout,
    vertex: {
      module: shaderModule,
      entryPoint: "vertexMain",
      buffers: [
        {
          arrayStride: Float32Array.BYTES_PER_ELEMENT * 3,
          attributes: [{ shaderLocation: 0, offset: 0, format: "float32x3" }],
        },
        {
          arrayStride: Float32Array.BYTES_PER_ELEMENT * 3,
          attributes: [{ shaderLocation: 1, offset: 0, format: "float32x3" }],
        },
        {
          arrayStride: Uint32Array.BYTES_PER_ELEMENT,
          attributes: [{ shaderLocation: 2, offset: 0, format: "uint32" }],
        },
      ],
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fragmentMain",
      targets: [
        {
          format: colorFormat,
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
      cullMode: "back",
    },
    depthStencil: {
      format: depthFormat,
      depthWriteEnabled: true,
      depthCompare: "less",
    },
  });

  return {
    pipeline,
    cameraBindGroupLayout,
  };
};
