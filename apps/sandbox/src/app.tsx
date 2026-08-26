import { compile } from "@photon/compiler";
import { createRenderer, type Renderer } from "@photon/renderer";
import { useEffect, useRef } from "react";
import { cornell } from "./cornell.ts";

export const App = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const compiled = compile(cornell, { depth: 10 });

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    let renderer: Renderer | undefined;
    let disposed = false;

    void (async () => {
      const nextRenderer = await createRenderer({
        canvas,
        camera: {
          projection: "perspective",
          // position: [256, 256, -256],
          // target: [0, 0, 0],
          // orthographicScale: 11,
          position: [0, 0, -18],
          target: [0, 0, 0],
          // orthographicScale: 15,
          verticalFov: 60,
        },
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
