import { compile } from "@photon/compiler";
import { createRenderer, type Renderer, type RendererStats } from "@photon/renderer";
import { useEffect, useMemo, useRef, useState } from "react";
import "./app.css";
import { Canvas } from "./canvas.tsx";
import { cornell, cornellCamera } from "./cornell.ts";
import { Sidebar } from "./sidebar.tsx";

const INITIAL_STATS: RendererStats = {
  isRunning: false,
  sampleCount: 0,
  elapsedMilliseconds: 0,
  maxSamples: 2048,
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
      onStatsChange: setStats,
    }).then((nextRenderer) => {
      if (disposed) {
        nextRenderer.stop();
        return;
      }

      createdRenderer = nextRenderer;
      rendererRef.current = nextRenderer;
      setReady(true);
      nextRenderer.start();
    });

    return () => {
      disposed = true;
      createdRenderer?.stop();
      rendererRef.current = null;
    };
  }, [compiled]);

  return (
    <div className="app">
      <Canvas ref={canvasRef} />
      <Sidebar
        stats={stats}
        ready={ready}
        onStart={() => rendererRef.current?.start()}
        onStop={() => rendererRef.current?.stop()}
      />
    </div>
  );
};
