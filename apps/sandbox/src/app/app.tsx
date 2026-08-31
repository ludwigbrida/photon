import { compile } from "@photon/compiler";
import {
  createRenderer,
  DEFAULT_MAX_SAMPLES,
  type Renderer,
  type RendererStats,
} from "@photon/renderer";
import { useEffect, useMemo, useRef, useState } from "react";
import { cornell, cornellCamera } from "../cornell.ts";
import { Sidebar } from "./sidebar/sidebar.tsx";
import { StatusBar } from "./status-bar/status-bar.tsx";
import { TopBar } from "./top-bar/top-bar.tsx";
import { Viewport } from "./viewport/viewport.tsx";

const INITIAL_STATS: RendererStats = {
  isRunning: false,
  sampleCount: 0,
  elapsedMilliseconds: 0,
  maxSamples: DEFAULT_MAX_SAMPLES,
};

export const App = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const [ready, setReady] = useState(false);
  const [stats, setStats] = useState<RendererStats>(INITIAL_STATS);

  const compiled = useMemo(() => compile(cornell, { depth: 10 }), []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    let disposed = false;
    let createdRenderer: Renderer | undefined;

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
      onStatsChange: setStats,
    }).then((nextRenderer) => {
      if (disposed) {
        nextRenderer.stop();
        return;
      }

      createdRenderer = nextRenderer;
      rendererRef.current = nextRenderer;
      setReady(true);
    });

    return () => {
      disposed = true;
      createdRenderer?.stop();
      rendererRef.current = null;
    };
  }, [compiled]);

  return (
    <main className="flex h-full flex-col">
      <TopBar isRendering={stats.isRunning} />
      <div className="flex min-h-0 flex-1">
        <Viewport ref={canvasRef} />
        <Sidebar
          ready={ready}
          maxSamples={stats.maxSamples}
          isRendering={stats.isRunning}
          isComplete={stats.sampleCount >= stats.maxSamples}
          onStart={() => rendererRef.current?.start()}
          onStop={() => rendererRef.current?.stop()}
          onMaxSamplesChange={(maxSamples) => rendererRef.current?.setMaxSamples(maxSamples)}
        />
      </div>
      <StatusBar
        elapsedMilliseconds={stats.elapsedMilliseconds}
        sampleCount={stats.sampleCount}
        maxSamples={stats.maxSamples}
      />
    </main>
  );
};
