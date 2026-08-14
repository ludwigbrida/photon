import { createContext } from "./helpers/context.ts";
import { createDevice } from "./helpers/device.ts";

export type RuntimeOptions = {
  canvas: HTMLCanvasElement;
};

export type Runtime = {
  start: () => void;
  stop: () => void;
};

export const createRuntime = async (options: RuntimeOptions): Promise<Runtime> => {
  const device = await createDevice();
  const context = createContext(options.canvas, device);

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
