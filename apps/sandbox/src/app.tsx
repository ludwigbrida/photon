import { group, material, pyramid, voxel } from "@photon/author";
import { compile } from "@photon/compiler";
import { createRenderer, type Renderer } from "@photon/renderer";
import { useEffect, useRef } from "react";

export const App = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const white = material({
    color: [1, 1, 1],
  });

  const red = material({
    color: [1, 0, 0],
  });

  const green = material({
    color: [0, 1, 0],
  });

  const blue = material({
    color: [0, 0, 1],
  });

  const warmLight = material({
    color: [1, 0.22, 0.03],
    emission: {
      color: [1, 0.16, 0.015],
      strength: 20,
    },
  });

  const mirror = material({
    color: [1, 1, 1],
    metallic: 1,
  });

  const scene = group(
    pyramid({
      position: [0, 0, 0],
      material: white,
      height: 10,
    }),
    voxel({
      position: [0, 3, -7],
      material: warmLight,
    }),
    voxel({
      position: [7, 3, 1],
      material: red,
    }),
    voxel({
      position: [7, 4, 1],
      material: green,
    }),
    voxel({
      position: [7, 5, 1],
      material: blue,
    }),
    voxel({
      position: [5, 5, -2],
      material: mirror,
    }),
    voxel({
      position: [5, 5, -1],
      material: mirror,
    }),
    voxel({
      position: [5, 6, -1],
      material: mirror,
    }),
    voxel({
      position: [5, 6, -2],
      material: mirror,
    }),
    voxel({
      position: [5, 7, -2],
      material: mirror,
    }),
    voxel({
      position: [5, 7, -1],
      material: mirror,
    }),
    voxel({
      position: [5, 7, 0],
      material: mirror,
    }),
    voxel({
      position: [5, 6, 0],
      material: mirror,
    }),
    voxel({
      position: [5, 5, 0],
      material: mirror,
    }),
    voxel({
      position: [5, 5, 1],
      material: mirror,
    }),
    voxel({
      position: [5, 6, 1],
      material: mirror,
    }),
    voxel({
      position: [5, 7, 1],
      material: mirror,
    }),
  );

  const compiled = compile(scene, { depth: 10 });

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    let renderer: Renderer | undefined;
    let disposed = false;

    void (async () => {
      const nextRenderer = await createRenderer({
        canvas,
        camera: {
          projection: "orthographic",
          position: [16, 16, -16],
          target: [0, 0, 0],
          orthographicScale: 11,
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
