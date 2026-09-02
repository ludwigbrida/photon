import type { Camera } from "../camera/types.ts";
import { createCameraUniform } from "../camera/uniform.ts";
import type { Environment } from "../environment/types.ts";
import { createEnvironmentUniform } from "../environment/uniform.ts";
import type { Scene } from "../types.ts";
import computeShader from "./compute.wesl?static";

type ComputeFrame = {
  readonly sampleIndex: number;
  readonly bucketX: number;
  readonly bucketY: number;
  readonly bucketGridSize: number;
};

export const createComputePass = (
  device: GPUDevice,
  context: GPUCanvasContext,
  accumulationBuffer: GPUBuffer,
  presentationTexture: GPUTextureView,
  camera: Camera,
  environment: Environment,
  scene: Scene,
) => {
  const workgroupSize = 8;
  const imageWidth = context.canvas.width;
  const imageHeight = context.canvas.height;
  const octreeDepth = scene.depth;
  const maxBounces = 3;
  const emitterCount = scene.emitters.length / 4;

  const shaderModule = device.createShaderModule({
    label: "computeShaderModule",
    code: computeShader,
  });

  const progressionBindGroupLayout = device.createBindGroupLayout({
    label: "computeProgressionBindGroupLayout",
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "storage",
        },
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
      {
        binding: 2,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "uniform",
        },
      },
    ],
  });

  const frameBuffer = device.createBuffer({
    label: "computeFrameBuffer",
    size: Uint32Array.BYTES_PER_ELEMENT * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const progressionBindGroup = device.createBindGroup({
    label: "computeProgressionBindGroup",
    layout: progressionBindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: accumulationBuffer,
      },
      {
        binding: 1,
        resource: presentationTexture,
      },
      {
        binding: 2,
        resource: frameBuffer,
      },
    ],
  });

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

  const environmentBindGroupLayout = device.createBindGroupLayout({
    label: "computeEnvironmentBindGroupLayout",
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

  const environmentUniform = createEnvironmentUniform(environment);

  const environmentBuffer = device.createBuffer({
    label: "computeEnvironmentBuffer",
    size: environmentUniform.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const environmentBindGroup = device.createBindGroup({
    label: "computeEnvironmentBindGroup",
    layout: environmentBindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: environmentBuffer,
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
      {
        binding: 2,
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

  const emitterBuffer = device.createBuffer({
    label: "computeEmitterBuffer",
    size: Math.max(scene.emitters.byteLength, 16),
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
      {
        binding: 2,
        resource: emitterBuffer,
      },
    ],
  });

  const pipelineLayout = device.createPipelineLayout({
    label: "computePipelineLayout",
    bindGroupLayouts: [
      progressionBindGroupLayout,
      cameraBindGroupLayout,
      environmentBindGroupLayout,
      sceneBindGroupLayout,
    ],
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
        MAX_BOUNCES: maxBounces,
        EMITTER_COUNT: emitterCount,
      },
    },
  });

  device.queue.writeBuffer(cameraBuffer, 0, cameraUniform);
  device.queue.writeBuffer(environmentBuffer, 0, environmentUniform);
  device.queue.writeBuffer(voxelBuffer, 0, scene.voxels);
  device.queue.writeBuffer(materialBuffer, 0, scene.materials);
  if (scene.emitters.byteLength > 0) {
    device.queue.writeBuffer(emitterBuffer, 0, scene.emitters);
  }

  const updateCamera = (camera: Camera) => {
    const uniform = createCameraUniform(camera);
    device.queue.writeBuffer(cameraBuffer, 0, uniform);
  };

  const run = (commandEncoder: GPUCommandEncoder, frame: ComputeFrame) => {
    device.queue.writeBuffer(
      frameBuffer,
      0,
      new Uint32Array([frame.sampleIndex, frame.bucketX, frame.bucketY, frame.bucketGridSize]),
    );

    const passEncoder = commandEncoder.beginComputePass({
      label: "computePassEncoder",
    });
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, progressionBindGroup);
    passEncoder.setBindGroup(1, cameraBindGroup);
    passEncoder.setBindGroup(2, environmentBindGroup);
    passEncoder.setBindGroup(3, sceneBindGroup);
    const bucketWidth = Math.ceil(imageWidth / frame.bucketGridSize);
    const bucketHeight = Math.ceil(imageHeight / frame.bucketGridSize);
    passEncoder.dispatchWorkgroups(
      Math.ceil(bucketWidth / workgroupSize),
      Math.ceil(bucketHeight / workgroupSize),
    );
    passEncoder.end();
  };

  return {
    run,
    updateCamera,
  };
};
