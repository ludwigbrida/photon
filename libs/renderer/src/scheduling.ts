export type RenderScheduling = {
  readonly bucketGridSize: number;
  readonly gpuBudget: number;
};

export type RenderBucket = {
  readonly x: number;
  readonly y: number;
  readonly gridSize: number;
};

export const DEFAULT_RENDER_SCHEDULING: RenderScheduling = {
  bucketGridSize: 16,
  gpuBudget: 0.75,
};

export const getBucketCount = ({ bucketGridSize }: RenderScheduling) => bucketGridSize ** 2;

export const getBucket = (scheduling: RenderScheduling, index: number): RenderBucket => {
  return {
    x: index % scheduling.bucketGridSize,
    y: Math.floor(index / scheduling.bucketGridSize),
    gridSize: scheduling.bucketGridSize,
  };
};

export const areRenderSchedulingsEqual = (left: RenderScheduling, right: RenderScheduling) =>
  left.bucketGridSize === right.bucketGridSize && left.gpuBudget === right.gpuBudget;
