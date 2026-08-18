import { group, material, pyramid, voxel } from "@photon/author";
import { compile } from "@photon/compiler";
import { createRenderer, type Renderer } from "@photon/renderer";
import { useEffect, useRef } from "react";

export const App = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stone = material({
    color: [0.45, 0.42, 0.38],
  });

  const red = material({
    color: [1, 0, 0],
  });

  const scene = group(
    pyramid({
      position: [0, 0, 0],
      material: stone,
      height: 2,
    }),
    voxel({
      position: [0, 0, 0],
      material: red,
    }),
  );

  const compiled = compile(scene, { depth: 4 });

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
