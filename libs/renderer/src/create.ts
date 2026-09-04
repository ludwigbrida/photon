import { createComputePass } from "./compute/compute.ts";
import { createContext } from "./helpers/context.ts";
import { createDevice } from "./helpers/device.ts";
import { DEFAULT_RENDER_SCHEDULING, getBucket, getBucketCount } from "./scheduling.ts";
import type { RendererConfig } from "./types/config.ts";
import type { RendererHandle } from "./types/handle.ts";
import type { RendererOptions } from "./types/options.ts";
import { createVisualizePass } from "./visualize/visualize.ts";

const TARGET_TILE_TIME = 4;
const MIN_BUCKET_GRID_SIZE = 4;
const MAX_BUCKET_GRID_SIZE = 64;

// For testing purposes only: use `undefined` to restore adaptive tile sizing.
const FIXED_BUCKET_GRID_SIZE: number | undefined = 1;

export const createRenderer = async (options: RendererOptions): Promise<RendererHandle> => {
  const device = await createDevice();
  const context = createContext(options.canvas, device);

  const accumulationBuffer = device.createBuffer({
    label: "accumulationBuffer",
    size: context.canvas.width * context.canvas.height * 4 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.STORAGE,
  });

  const presentationTexture = device
    .createTexture({
      label: "presentationTexture",
      size: [context.canvas.width, context.canvas.height],
      format: "rgba8unorm",
      usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING,
    })
    .createView({
      label: "presentationTextureView",
    });

  const computePass = createComputePass(
    device,
    context,
    accumulationBuffer,
    presentationTexture,
    options.scene,
  );

  const visualizePass = createVisualizePass(device, context, presentationTexture);

  let running = false;
  let sample = 0;
  let bucketIndex = 0;
  const maxSamples = 1024;
  let scheduling = {
    ...DEFAULT_RENDER_SCHEDULING,
    bucketGridSize: FIXED_BUCKET_GRID_SIZE ?? DEFAULT_RENDER_SCHEDULING.bucketGridSize,
  };
  let computeHandle: number | null = null;
  let presentHandle: number | null = null;
  let computeInFlight = false;

  let elapsedMilliseconds = 0;
  let startedAt: number | undefined;
  let runId = 0;

  const getElapsedMilliseconds = () =>
    elapsedMilliseconds + (startedAt === undefined ? 0 : performance.now() - startedAt);

  const reportStats = () => {
    options.onTelemetryChange?.({
      isRunning: running,
      sampleCount: sample,
      elapsedMilliseconds: getElapsedMilliseconds(),
      maxSamples,
      scheduling,
    });
  };

  const schedulePresent = (scheduledRunId: number) => {
    if (presentHandle !== null) {
      return;
    }

    presentHandle = requestAnimationFrame(() => {
      presentHandle = null;

      if (!running || scheduledRunId !== runId) {
        return;
      }

      const commandEncoder = device.createCommandEncoder({ label: "presentCommandEncoder" });
      visualizePass.run(commandEncoder);
      device.queue.submit([commandEncoder.finish({ label: "presentCommandBuffer" })]);

      schedulePresent(scheduledRunId);
    });
  };

  const scheduleCompute = (scheduledRunId: number, delayMilliseconds = 0) => {
    computeHandle = window.setTimeout(() => {
      computeHandle = null;
      void compute(scheduledRunId);
    }, delayMilliseconds);
  };

  const waitForSubmittedWork = () => {
    const queue = device.queue as GPUQueue & {
      onSubmittedWorkDone?: () => Promise<undefined>;
    };

    return (
      queue.onSubmittedWorkDone?.() ??
      new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    );
  };

  const stop = () => {
    if (!running) {
      return;
    }

    elapsedMilliseconds = getElapsedMilliseconds();
    startedAt = undefined;
    running = false;

    runId += 1;

    if (computeHandle !== null) {
      clearTimeout(computeHandle);
      computeHandle = null;
    }

    if (presentHandle !== null) {
      cancelAnimationFrame(presentHandle);
      presentHandle = null;
    }

    reportStats();
  };

  const reset = () => {
    sample = 0;
    bucketIndex = 0;
    elapsedMilliseconds = 0;
    startedAt = running ? performance.now() : undefined;

    if (running && !computeInFlight && computeHandle === null) {
      scheduleCompute(runId);
    }

    reportStats();
  };

  const setGpuBudget = (gpuBudget: number) => {
    if (
      !Number.isFinite(gpuBudget) ||
      gpuBudget < 0.1 ||
      gpuBudget > 1 ||
      gpuBudget === scheduling.gpuBudget
    ) {
      return;
    }

    scheduling = { ...scheduling, gpuBudget };
    reportStats();
  };

  const compute = async (renderRunId: number) => {
    if (!running || renderRunId !== runId || sample >= maxSamples || computeInFlight) {
      return;
    }

    const commandEncoder = device.createCommandEncoder({ label: "computeCommandEncoder" });

    const bucket = getBucket(scheduling.bucketGridSize, bucketIndex);
    computePass.run(commandEncoder, {
      sampleIndex: sample,
      bucketX: bucket.x,
      bucketY: bucket.y,
      bucketGridSize: bucket.gridSize,
    });

    const computeStartedAt = performance.now();
    computeInFlight = true;
    device.queue.submit([commandEncoder.finish({ label: "computeCommandBuffer" })]);

    bucketIndex += 1;

    const completedSample = bucketIndex === getBucketCount(scheduling.bucketGridSize);
    if (completedSample) {
      sample += 1;
      bucketIndex = 0;
      reportStats();
    }

    await waitForSubmittedWork();
    computeInFlight = false;

    if (!running || renderRunId !== runId) {
      if (running) {
        scheduleCompute(runId);
      }
      return;
    }

    if (sample >= maxSamples) {
      elapsedMilliseconds = getElapsedMilliseconds();
      startedAt = undefined;
      reportStats();
      return;
    }

    const elapsed = performance.now() - computeStartedAt;
    if (FIXED_BUCKET_GRID_SIZE === undefined && (completedSample || sample === 0)) {
      const bucketGridSize =
        elapsed < TARGET_TILE_TIME / 2
          ? Math.max(MIN_BUCKET_GRID_SIZE, Math.floor(scheduling.bucketGridSize / 2))
          : elapsed > TARGET_TILE_TIME * 2
            ? Math.min(MAX_BUCKET_GRID_SIZE, scheduling.bucketGridSize * 2)
            : scheduling.bucketGridSize;
      if (bucketGridSize !== scheduling.bucketGridSize) {
        scheduling = { ...scheduling, bucketGridSize };
        if (!completedSample && sample === 0) {
          bucketIndex = 0;
        }
        reportStats();
      }
    }

    const cooldown = elapsed * ((1 - scheduling.gpuBudget) / scheduling.gpuBudget);
    scheduleCompute(renderRunId, cooldown);
  };

  const start = () => {
    if (running) {
      return;
    }

    running = true;
    startedAt = performance.now();

    runId += 1;

    reportStats();
    if (sample < maxSamples) {
      scheduleCompute(runId);
    }
    schedulePresent(runId);
  };

  const configure = (config: Partial<RendererConfig>) => {
    if (config.gpuBudget !== undefined) {
      setGpuBudget(config.gpuBudget);
    }

    if (config.camera) {
      computePass.updateCamera(config.camera);
    }

    if (config.environment) {
      computePass.updateEnvironment(config.environment);
    }

    if (config.camera || config.environment) {
      reset();
    }
  };

  return {
    start,
    stop,
    configure,
  };
};
