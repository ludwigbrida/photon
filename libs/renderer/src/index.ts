import { createComputePass } from "./compute/compute.ts";
import { createAccumulation } from "./helpers/accumulation.ts";
import { createContext } from "./helpers/context.ts";
import { createDevice } from "./helpers/device.ts";
import { Camera, Environment, Scene } from "./types.ts";
import { createVisualizePass } from "./visualize/visualize.ts";

export type RendererOptions = {
  readonly canvas: HTMLCanvasElement;
  readonly camera: Camera;
  readonly environment: Environment;
  readonly scene: Scene;
  readonly onStatsChange?: (stats: RendererStats) => void;
};

export type RendererStats = {
  readonly isRunning: boolean;
  readonly sampleCount: number;
  readonly elapsedMilliseconds: number;
  readonly maxSamples: number;
};

export type Renderer = {
  start: () => void;
  stop: () => void;
};

const MAX_SAMPLES = 2048;

export const createRenderer = async (options: RendererOptions): Promise<Renderer> => {
  const device = await createDevice();
  const context = createContext(options.canvas, device);

  const [accumulationViewA, accumulationViewB] = createAccumulation(device, context);

  const computePass = createComputePass(
    device,
    context,
    accumulationViewA,
    accumulationViewB,
    options.camera,
    options.environment,
    options.scene,
  );

  const visualizePass = createVisualizePass(device, context, accumulationViewA, accumulationViewB);

  let running = false;
  let sample = 0;
  let frameHandle: number | null = null;

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
      maxSamples: MAX_SAMPLES,
    });
  };

  const scheduleRender = (scheduledRunId: number) => {
    frameHandle = requestAnimationFrame(() => {
      frameHandle = null;
      void render(scheduledRunId);
    });
  };

  const stop = () => {
    if (!running) {
      return;
    }

    elapsedMilliseconds = getElapsedMilliseconds();
    startedAt = undefined;
    running = false;

    runId += 1;

    if (frameHandle !== null) {
      cancelAnimationFrame(frameHandle);
      frameHandle = null;
    }

    reportStats();
  };

  const render = async (renderRunId: number) => {
    if (!running || renderRunId !== runId || sample >= MAX_SAMPLES) {
      return;
    }

    const commandEncoder = device.createCommandEncoder({
      label: "commandEncoder",
    });

    computePass.run(commandEncoder, sample);

    visualizePass.run(commandEncoder, sample);

    const commandBuffer = commandEncoder.finish({
      label: "commandBuffer",
    });

    device.queue.submit([commandBuffer]);

    // The submitted sample will contribute to the accumulation.
    sample += 1;
    reportStats();

    await device.queue.onSubmittedWorkDone();

    if (!running || renderRunId !== runId) {
      return;
    }

    if (sample >= MAX_SAMPLES) {
      stop();
      return;
    }

    scheduleRender(renderRunId);
  };

  const start = () => {
    if (running || sample >= MAX_SAMPLES) {
      return;
    }

    running = true;
    startedAt = performance.now();

    runId += 1;

    reportStats();
    scheduleRender(runId);
  };

  return {
    start,
    stop,
  };
};
