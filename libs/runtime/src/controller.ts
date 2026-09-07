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
  readonly initialCamera: Camera;
  readonly initialEnvironment: Environment;
  readonly initialGpuBudget: number;
  readonly initialTelemetry: RendererTelemetry;
  readonly mountCanvas: (canvas: HTMLCanvasElement, options: MountOptions) => () => void;
  readonly configure: (options: Partial<RendererConfig>) => void;
  readonly reset: () => void;
  readonly start: () => void;
  readonly stop: () => void;
};

type RendererConfig = { camera: Camera; environment: Environment; gpuBudget: number };
type MountOptions = Pick<RendererConfig, "camera" | "gpuBudget"> & {
  onTelemetryChange: (telemetry: RendererTelemetry) => void;
  onReadyChange: (ready: boolean) => void;
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
  const gpuBudget = DEFAULT_RENDER_SCHEDULING.gpuBudget;

  const mountCanvas = (
    canvas: HTMLCanvasElement,
    { camera, gpuBudget, onTelemetryChange, onReadyChange }: MountOptions,
  ) => {
    let disposed = false;

    void createRenderer({
      canvas,
      scene: compiled,
      onTelemetryChange,
    }).then((nextRenderer) => {
      if (disposed) {
        nextRenderer.stop();
        return;
      }

      renderer.current = nextRenderer;
      nextRenderer.configure({
        camera,
        environment,
        gpuBudget,
      });

      onReadyChange(true);
      nextRenderer.start();
    });

    return () => {
      disposed = true;
      renderer.current?.stop();
      renderer.current = null;
      onReadyChange(false);
    };
  };

  return {
    initialCamera,
    initialEnvironment: environment,
    initialGpuBudget: gpuBudget,
    initialTelemetry: createInitialTelemetry(),
    mountCanvas,
    configure: (options) => renderer.current?.configure(options),
    reset: () => renderer.current?.reset(),
    start: () => renderer.current?.start(),
    stop: () => renderer.current?.stop(),
  };
};
