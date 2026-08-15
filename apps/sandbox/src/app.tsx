import { compile, voxel } from "@photon/author";
import { createRuntime, type Runtime } from "@photon/runtime";
import { useEffect, useRef } from "react";

export const App = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const scene = voxel({
    position: [0, 0, 0],
    color: [1, 0, 0],
  });

  const compiled = compile(scene);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    let renderer: Runtime | undefined;
    let disposed = false;

    void (async () => {
      const nextRenderer = await createRuntime({ canvas, scene: compiled });

      if (disposed) {
        nextRenderer.stop();
        return;
      }

      renderer = nextRenderer;

      renderer.start();
    })();

    return () => {
      disposed = true;
      renderer?.stop();
    };
  }, [canvasRef.current]);

  return <canvas ref={canvasRef} />;
};
