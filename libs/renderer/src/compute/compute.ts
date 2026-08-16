import { Camera, createCameraUniform, Scene } from "../types.ts";
import shaderCode from "./compute.wgsl?raw";

export const createComputePass = (
  device: GPUDevice,
  context: GPUCanvasContext,
  accumulationViewA: GPUTextureView,
  accumulationViewB: GPUTextureView,
  camera: Camera,
  scene: Scene,
) => {
  const workgroupSize = 8;
  const imageWidth = context.canvas.width;
  const imageHeight = context.canvas.height;
  const octreeDepth = scene.depth;

  const shaderModule = device.createShaderModule({
    label: "computeShaderModule",
    code: shaderCode,
  });

  const accumulationBindGroupLayout = device.createBindGroupLayout({
    label: "computeAccumulationBindGroupLayout",
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        texture: {},
      },
      {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        storageTexture: {
          access: "write-only",
          format: "rgba8unorm",
          viewDimension: "2d",
        },
      },
    ],
  });

  const accumulationBindGroups = [
    device.createBindGroup({
      label: "computeAccumulationBindGroupA",
      layout: accumulationBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: accumulationViewA,
        },
        {
          binding: 1,
          resource: accumulationViewB,
        },
      ],
    }),
    device.createBindGroup({
      label: "computeAccumulationBindGroupB",
      layout: accumulationBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: accumulationViewB,
        },
        {
          binding: 1,
          resource: accumulationViewA,
        },
      ],
    }),
  ] as const;

  const cameraBindGroupLayout = device.createBindGroupLayout({
    label: "computeCameraBindGroupLayout",
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "uniform",
        },
      },
    ],
  });

  const cameraUniform = createCameraUniform(camera);

  const cameraBuffer = device.createBuffer({
    label: "computeCameraBuffer",
    size: cameraUniform.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const cameraBindGroup = device.createBindGroup({
    label: "computeCameraBindGroup",
    layout: cameraBindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: cameraBuffer,
      },
    ],
  });

  const sceneBindGroupLayout = device.createBindGroupLayout({
    label: "computeSceneBindGroupLayout",
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "read-only-storage",
        },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "read-only-storage",
        },
      },
    ],
  });

  const voxelBuffer = device.createBuffer({
    label: "computeVoxelBuffer",
    size: scene.voxels.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const materialBuffer = device.createBuffer({
    label: "computeMaterialBuffer",
    size: scene.materials.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const sceneBindGroup = device.createBindGroup({
    label: "computeSceneBindGroup",
    layout: sceneBindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: voxelBuffer,
      },
      {
        binding: 1,
        resource: materialBuffer,
      },
    ],
  });

  const pipelineLayout = device.createPipelineLayout({
    label: "computePipelineLayout",
    bindGroupLayouts: [accumulationBindGroupLayout, cameraBindGroupLayout, sceneBindGroupLayout],
  });

  const pipeline = device.createComputePipeline({
    label: "computePipeline",
    layout: pipelineLayout,
    compute: {
      module: shaderModule,
      entryPoint: "main",
      constants: {
        WORKGROUP_SIZE: workgroupSize,
        IMAGE_WIDTH: imageWidth,
        IMAGE_HEIGHT: imageHeight,
        OCTREE_DEPTH: octreeDepth,
      },
    },
  });

  device.queue.writeBuffer(cameraBuffer, 0, cameraUniform);
  device.queue.writeBuffer(voxelBuffer, 0, scene.voxels);
  device.queue.writeBuffer(materialBuffer, 0, scene.materials);

  const run = (commandEncoder: GPUCommandEncoder, sample: number) => {
    const passEncoder = commandEncoder.beginComputePass({
      label: "computePassEncoder",
    });
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, accumulationBindGroups[sample % 2]);
    passEncoder.setBindGroup(1, cameraBindGroup);
    passEncoder.setBindGroup(2, sceneBindGroup);
    passEncoder.dispatchWorkgroups(imageWidth / workgroupSize, imageHeight / workgroupSize);
    passEncoder.end();
  };

  return {
    run,
  };
};
