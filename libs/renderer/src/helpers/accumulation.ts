/**
 * Texture formats are `rgba16float` to support HDR. This is necessary for correct sample
 * accumulation and radiance values.
 */
export const createAccumulation = (device: GPUDevice, context: GPUCanvasContext) => {
  const accumulationTextureA = device.createTexture({
    label: "accumulationTextureA",
    size: [context.canvas.width, context.canvas.height],
    format: "rgba16float",
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING,
  });

  const accumulationTextureB = device.createTexture({
    label: "accumulationTextureB",
    size: [context.canvas.width, context.canvas.height],
    format: "rgba16float",
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING,
  });

  const accumulationViewA = accumulationTextureA.createView({
    label: "accumulationViewA",
  });

  const accumulationViewB = accumulationTextureB.createView({
    label: "accumulationViewB",
  });

  return [accumulationViewA, accumulationViewB] as const;
};
