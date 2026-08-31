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
};

export type Renderer = {
  start: () => void;
  stop: () => void;
};

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

  const scheduleRender = () => {
    frameHandle = requestAnimationFrame(() => {
      frameHandle = null;
      void render();
    });
  };

  const render = async () => {
    if (!running) {
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

    sample += 1;

    await device.queue.onSubmittedWorkDone();

    if (running) {
      scheduleRender();
    }
  };

  const start = () => {
    if (running) {
      return;
    }

    running = true;
    scheduleRender();
  };

  const stop = () => {
    running = false;

    if (frameHandle !== null) {
      cancelAnimationFrame(frameHandle);
      sample = 0;
      frameHandle = null;
    }
  };

  return {
    start,
    stop,
  };
};
