import { derived, grain } from "@grainular/grains";
import { createRef, html } from "@grainular/nord";
import { compile } from "@photon/compiler";
import {
  createRenderer,
  DEFAULT_MAX_SAMPLES,
  type Renderer,
  type RendererStats,
} from "@photon/renderer";
import { cornell, cornellCamera } from "../cornell.ts";
import { Sidebar } from "./sidebar/sidebar.ts";
import { StatusBar } from "./status-bar/status-bar.ts";
import { TopBar } from "./top-bar/top-bar.ts";
import { Viewport } from "./viewport/viewport.ts";

const INITIAL_STATS: RendererStats = {
  isRunning: false,
  sampleCount: 0,
  elapsedMilliseconds: 0,
  maxSamples: DEFAULT_MAX_SAMPLES,
};

export const App = () => {
  const canvasRef = createRef<HTMLCanvasElement>();
  const renderer = { current: null as Renderer | null };
  const ready = grain(false);
  const stats = grain<RendererStats>(INITIAL_STATS);
  const isRendering = derived(stats, ({ isRunning }) => isRunning);
  const maxSamples = derived(stats, ({ maxSamples: value }) => value);
  const isComplete = derived(stats, ({ sampleCount, maxSamples: max }) => sampleCount >= max);
  const compiled = compile(cornell, { depth: 10 });

  const createRendererForCanvas = () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return () => {};
    }

    let disposed = false;

    void createRenderer({
      canvas,
      camera: cornellCamera,
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
      scene: compiled,
      maxSamples: DEFAULT_MAX_SAMPLES,
      onStatsChange: stats.set,
    }).then((nextRenderer) => {
      if (disposed) {
        nextRenderer.stop();
        return;
      }

      renderer.current = nextRenderer;
      ready.set(true);
    });

    return () => {
      disposed = true;
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
          maxSamples,
          isRendering,
          isComplete,
          onStart: () => renderer.current?.start(),
          onStop: () => renderer.current?.stop(),
          onMaxSamplesChange: (value) => renderer.current?.setMaxSamples(value),
        })}
      </div>
      ${StatusBar({ stats })}
    </main>
  `;
};
