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

export const getBucketCount = (bucketGridSize: number) => bucketGridSize ** 2;

export const getBucket = (bucketGridSize: number, index: number): RenderBucket => {
  return {
    x: index % bucketGridSize,
    y: Math.floor(index / bucketGridSize),
    gridSize: bucketGridSize,
  };
};
