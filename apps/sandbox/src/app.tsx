import { voxel } from "@photon/author";
import { compile } from "@photon/compiler";
import { createRuntime, type Runtime } from "@photon/runtime";
import { useEffect, useRef } from "react";

export const App = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const scene = voxel({
    position: [0, 0, 0],
    color: [1, 0, 0],
  });

  const compiled = compile(scene, { depth: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    let renderer: Runtime | undefined;
    let disposed = false;

    void (async () => {
      const nextRenderer = await createRuntime({
        canvas,
        scene: compiled,
        camera: {
          mode: "orthographic",
          position: [0, 0, 0],
          target: [1, 1, 1],
          scale: 2,
        },
      });

      console.log("Rebuilding...");

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
  }, [canvasRef.current, compiled]);

  return <canvas ref={canvasRef} width={640} height={480} />;
};
