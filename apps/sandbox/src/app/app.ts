import { derived, grain } from "@grainular/grains";
import { createRef, html } from "@grainular/nord";
import { compile } from "@photon/compiler";
import type { Camera } from "@photon/renderer";
import {
  createRenderer,
  DEFAULT_MAX_SAMPLES,
  DEFAULT_RENDER_SCHEDULING,
  RendererHandle,
  type Renderer,
  type RendererTelemetry,
} from "@photon/renderer";
import { cornell, cornellCamera } from "../scenes/cornell.ts";
import { Sidebar } from "./sidebar/sidebar.ts";
import { StatusBar } from "./status-bar/status-bar.ts";
import { TopBar } from "./top-bar/top-bar.ts";
import { Viewport } from "./viewport/viewport.ts";

const INITIAL_TELEMETRY: RendererTelemetry = {
  isRunning: false,
  sampleCount: 0,
  elapsedMilliseconds: 0,
  maxSamples: DEFAULT_MAX_SAMPLES,
  scheduling: DEFAULT_RENDER_SCHEDULING,
};

export const App = () => {
  const canvasRef = createRef<HTMLCanvasElement>();
  const renderer = { current: null as (Renderer & RendererHandle) | null };
  const ready = grain(false);
  const telemetry = grain<RendererTelemetry>(INITIAL_TELEMETRY);
  const isRendering = derived(telemetry, ({ isRunning }) => isRunning);
  const scheduling = derived(telemetry, ({ scheduling: value }) => value);
  const isComplete = derived(telemetry, ({ sampleCount, maxSamples: max }) => sampleCount >= max);
  const compiled = compile(cornell, { depth: 10 });
  const camera = grain<Camera>(cornellCamera);
  const cameraPosition = derived(camera, (value) => value.position);

  const createRendererForCanvas = () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return () => {};
    }

    let disposed = false;

    let unsubscribeCamera: (() => void) | undefined;

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
        environment: {
          sun: {
            azimuthDegrees: 35,
            elevationDegrees: 45,
            angularRadiusDegrees: 5,
            intensity: 5,
            color: [1, 0.98, 0.92],
          },
          sky: {
            horizonColor: [0.65, 0.78, 1],
            zenithColor: [0.08, 0.28, 0.72],
            horizonFalloff: 1.4,
          },
        },
      });

      unsubscribeCamera = camera.subscribe((camera) => {
        nextRenderer.configure({ camera });
      });

      ready.set(true);
    });

    return () => {
      disposed = true;
      unsubscribeCamera?.();
      renderer.current?.stop();
      renderer.current = null;
    };
  };

  return html`
    <main class="flex h-full flex-col">
      ${TopBar({ isRendering })}
      <div class="flex min-h-0 flex-1">
        ${Viewport({ canvasRef, onMount: createRendererForCanvas })}
        ${Sidebar({
          ready,
          scheduling,
          isRendering,
          isComplete,
          cameraPosition,
          onStart: () => renderer.current?.start(),
          onStop: () => renderer.current?.stop(),
          onGpuBudgetChange: (value) => renderer.current?.setGpuBudget(value),
          onCameraPositionChange: (position) =>
            camera.update((current) => ({
              ...current,
              position,
            })),
        })}
      </div>
      ${StatusBar({ telemetry })}
    </main>
  `;
};
