import { createComputePass } from "./compute/compute.ts";
import { createAccumulation } from "./helpers/accumulation.ts";
import { createContext } from "./helpers/context.ts";
import { createDevice } from "./helpers/device.ts";
import { SceneInput } from "./types.ts";
import { createVisualizePass } from "./visualize/visualize.ts";

export type RuntimeOptions = {
  canvas: HTMLCanvasElement;
  scene: SceneInput;
};

export type Runtime = {
  start: () => void;
  stop: () => void;
};

export const createRuntime = async (options: RuntimeOptions): Promise<Runtime> => {
  const device = await createDevice();
  const context = createContext(options.canvas, device);

  const [accumulationViewA, accumulationViewB] = createAccumulation(device, context);

  const computePass = createComputePass(
    device,
    context,
    accumulationViewA,
    accumulationViewB,
    options.scene,
  );

  const visualizePass = createVisualizePass(device, context, accumulationViewA, accumulationViewB);

  let running = false;
  let sample = 0;
  let frameHandle: number | null = null;

  const render = () => {
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
    frameHandle = requestAnimationFrame(render);
  };

  const start = () => {
    if (running) {
      return;
    }

    running = true;
    frameHandle = requestAnimationFrame(render);
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
