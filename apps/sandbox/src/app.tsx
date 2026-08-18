import { group, voxel } from "@photon/author";
import { compile } from "@photon/compiler";
import { createRenderer, type Renderer } from "@photon/renderer";
import { useEffect, useRef } from "react";

export const App = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const scene = group(
    voxel({
      position: [0, 0, 0],
      color: [1, 0, 0],
    }),
    voxel({
      position: [0, 0, 1],
      color: [0, 1, 0],
    }),
    voxel({
      position: [1, 0, 0],
      color: [0, 0, 1],
    }),
    voxel({
      position: [1, 0, 1],
      color: [1, 0, 1],
    }),
  );

  const compiled = compile(scene, { depth: 2 });

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    let renderer: Renderer | undefined;
    let disposed = false;

    void (async () => {
      const nextRenderer = await createRenderer({
        canvas,
        scene: compiled,
        camera: {
          mode: "orthographic",
          position: [5, 5, -3],
          target: [1, 1, 1],
          scale: 2,
        },
      });

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
