import type { Camera } from "@photon/core";
import type { World } from "@photon/world";

export type RasterizerConfig = {
  readonly device: GPUDevice;
  readonly colorFormat: GPUTextureFormat;
  readonly depthFormat: GPUTextureFormat;
};

export type RasterizerFrame = {
  readonly world: World;
  readonly camera: Camera;
  readonly colorTarget: GPUTextureView;
  readonly depthTarget: GPUTextureView;
  readonly width: number;
  readonly height: number;
};

export type Rasterizer = {
  readonly render: (frame: RasterizerFrame) => void;
};
