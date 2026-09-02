export type Scene = {
  readonly depth: number;
  readonly voxels: Uint32Array;
  readonly materials: Float32Array;
  readonly emitters: Float32Array;
};
