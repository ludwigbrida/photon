import { createComputePass } from "./compute/compute.ts";
import { createContext } from "./helpers/context.ts";
import { createDevice } from "./helpers/device.ts";
import {
  areRenderSchedulingsEqual,
  DEFAULT_RENDER_SCHEDULING,
  getBucket,
  getBucketCount,
  type RenderScheduling,
} from "./scheduling.ts";
import { Camera, Environment, Scene } from "./types.ts";
import type { RendererConfig } from "./types/config.ts";
import { RendererHandle } from "./types/handle.ts";
import { createVisualizePass } from "./visualize/visualize.ts";

export { DEFAULT_RENDER_SCHEDULING, type RenderScheduling } from "./scheduling.ts";
export type { RendererConfig } from "./types/config.ts";
export type { RendererHandle } from "./types/handle.ts";

export type RendererOptions = {
  readonly canvas: HTMLCanvasElement;
  readonly camera: Camera;
  readonly environment: Environment;
  readonly scene: Scene;
  readonly maxSamples: number;
  readonly scheduling?: RenderScheduling;
  readonly onStatsChange?: (stats: RendererStats) => void;
};

export type RendererStats = {
  readonly isRunning: boolean;
  readonly sampleCount: number;
  readonly elapsedMilliseconds: number;
  readonly maxSamples: number;
  readonly scheduling: RenderScheduling;
};

export type Renderer = {
  start: () => void;
  stop: () => void;
  setMaxSamples: (maxSamples: number) => void;
  setScheduling: (scheduling: RenderScheduling) => void;
  setGpuBudget: (gpuBudget: number) => void;
};

export const DEFAULT_MAX_SAMPLES = 256;
const TARGET_TILE_TIME = 4;
const MIN_BUCKET_GRID_SIZE = 4;
const MAX_BUCKET_GRID_SIZE = 64;

export const createRenderer = async (
  options: RendererOptions,
): Promise<Renderer & RendererHandle> => {
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
    options.camera,
    options.environment,
    options.scene,
  );

  const visualizePass = createVisualizePass(device, context, presentationTexture);

  let running = false;
  let sample = 0;
  let bucketIndex = 0;
  let maxSamples = options.maxSamples;
  let scheduling = options.scheduling ?? DEFAULT_RENDER_SCHEDULING;
  let computeHandle: number | null = null;
  let presentHandle: number | null = null;
  let computeInFlight = false;

  let elapsedMilliseconds = 0;
  let startedAt: number | undefined;
  let runId = 0;

  const getElapsedMilliseconds = () =>
    elapsedMilliseconds + (startedAt === undefined ? 0 : performance.now() - startedAt);

  const reportStats = () => {
    options.onStatsChange?.({
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

  const setMaxSamples = (nextMaxSamples: number) => {
    if (!Number.isInteger(nextMaxSamples) || nextMaxSamples < 1) {
      return;
    }

    maxSamples = nextMaxSamples;

    if (running && sample >= maxSamples) {
      stop();
      return;
    }

    reportStats();
  };

  const reset = () => {
    sample = 0;
    bucketIndex = 0;
    elapsedMilliseconds = 0;
    startedAt = undefined;
  };

  const setScheduling = (nextScheduling: RenderScheduling) => {
    if (
      !Number.isInteger(nextScheduling.bucketGridSize) ||
      nextScheduling.bucketGridSize < MIN_BUCKET_GRID_SIZE ||
      nextScheduling.bucketGridSize > MAX_BUCKET_GRID_SIZE ||
      !Number.isFinite(nextScheduling.gpuBudget) ||
      nextScheduling.gpuBudget < 0.1 ||
      nextScheduling.gpuBudget > 1 ||
      areRenderSchedulingsEqual(scheduling, nextScheduling)
    ) {
      return;
    }

    const resume = running;

    if (resume) {
      stop();
    }

    scheduling = nextScheduling;
    reset();
    reportStats();

    if (resume) {
      start();
    }
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

    const bucket = getBucket(scheduling, bucketIndex);
    computePass.run(commandEncoder, {
      sampleIndex: sample,
      bucketX: bucket.x,
      bucketY: bucket.y,
      bucketGridSize: bucket.gridSize,
    });

    const startedAt = performance.now();
    computeInFlight = true;
    device.queue.submit([commandEncoder.finish({ label: "computeCommandBuffer" })]);

    bucketIndex += 1;

    const completedSample = bucketIndex === getBucketCount(scheduling);
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
      stop();
      return;
    }

    const elapsed = performance.now() - startedAt;
    if (completedSample || sample === 0) {
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
    if (running || sample >= maxSamples) {
      return;
    }

    running = true;
    startedAt = performance.now();

    runId += 1;

    reportStats();
    scheduleCompute(runId);
    schedulePresent(runId);
  };

  const configure = (config: Partial<RendererConfig>) => {
    if (config.camera) {
      computePass.updateCamera(config.camera);
    }

    if (config.camera) {
      reset();
    }
  };

  return {
    start,
    stop,
    setMaxSamples,
    setScheduling,
    setGpuBudget,
    configure,
  };
};
