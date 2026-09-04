import { grain, type Grain, type WritableGrain } from "@grainular/grains";
import type { Shape } from "@photon/author";
import { compile } from "@photon/compiler";
import {
  createRenderer,
  DEFAULT_MAX_SAMPLES,
  DEFAULT_RENDER_SCHEDULING,
  type Camera,
  type Environment,
  type RendererHandle,
  type RendererTelemetry,
} from "@photon/renderer";

export type RuntimeOptions = {
  readonly scene: Shape;
  readonly camera: Camera;
  readonly environment: Environment;
  readonly depth?: number;
};

export type RuntimeController = {
  readonly ready: Grain<boolean>;
  readonly telemetry: Grain<RendererTelemetry>;
  readonly camera: WritableGrain<Camera>;
  readonly gpuBudget: WritableGrain<number>;
  readonly mountCanvas: (canvas: HTMLCanvasElement) => () => void;
  readonly start: () => void;
  readonly stop: () => void;
};

const createInitialTelemetry = (): RendererTelemetry => ({
  isRunning: false,
  sampleCount: 0,
  elapsedMilliseconds: 0,
  maxSamples: DEFAULT_MAX_SAMPLES,
  scheduling: DEFAULT_RENDER_SCHEDULING,
});

export const createController = ({
  scene,
  camera: initialCamera,
  environment,
  depth = 10,
}: RuntimeOptions): RuntimeController => {
  const compiled = compile(scene, { depth });
  const renderer = { current: null as RendererHandle | null };
  const ready = grain(false);
  const telemetry = grain<RendererTelemetry>(createInitialTelemetry());
  const camera = grain<Camera>(initialCamera);
  const gpuBudget = grain(DEFAULT_RENDER_SCHEDULING.gpuBudget);

  const mountCanvas = (canvas: HTMLCanvasElement) => {
    let disposed = false;
    let unsubscribeCamera: (() => void) | undefined;
    let unsubscribeGpuBudget: (() => void) | undefined;

    void createRenderer({
      canvas,
      scene: compiled,
      onTelemetryChange: telemetry.set,
    }).then((nextRenderer) => {
      if (disposed) {
        nextRenderer.stop();
        return;
      }

      renderer.current = nextRenderer;
      nextRenderer.configure({
        camera: camera(),
        environment,
        gpuBudget: gpuBudget(),
      });

      unsubscribeCamera = camera.subscribe((value) => nextRenderer.configure({ camera: value }));
      unsubscribeGpuBudget = gpuBudget.subscribe((value) =>
        nextRenderer.configure({ gpuBudget: value }),
      );
      ready.set(true);
      nextRenderer.start();
    });

    return () => {
      disposed = true;
      unsubscribeCamera?.();
      unsubscribeGpuBudget?.();
      renderer.current?.stop();
      renderer.current = null;
      ready.set(false);
    };
  };

  return {
    ready,
    telemetry,
    camera,
    gpuBudget,
    mountCanvas,
    start: () => renderer.current?.start(),
    stop: () => renderer.current?.stop(),
  };
};
