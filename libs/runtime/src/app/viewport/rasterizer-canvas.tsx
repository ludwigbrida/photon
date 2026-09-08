import type { Camera } from "@photon/core";
import { createRasterizer } from "@photon/rasterizer";
import type { World } from "@photon/world";
import { useEffect, useRef } from "react";

type RasterizerCanvasProps = {
  readonly world: World;
  readonly camera: Camera;
};

type RasterizerCanvasResources = {
  readonly render: () => void;
  readonly destroy: () => void;
};

export const RasterizerCanvas = ({ world, camera }: RasterizerCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef({ world, camera });
  const resourcesRef = useRef<RasterizerCanvasResources | null>(null);

  frameRef.current = { world, camera };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas === null || navigator.gpu === undefined) {
      return;
    }

    let disposed = false;

    void (async () => {
      const adapter = await navigator.gpu.requestAdapter();

      if (adapter === null) {
        return;
      }

      // TODO: Share a runtime-owned device once the path tracer has been adapted.
      const device = await adapter.requestDevice();

      if (disposed) {
        device.destroy();
        return;
      }

      const context = canvas.getContext("webgpu");

      if (context === null) {
        device.destroy();
        return;
      }

      const colorFormat = navigator.gpu.getPreferredCanvasFormat();
      const depthFormat = "depth24plus";

      context.configure({ device, format: colorFormat });

      const depthTexture = device.createTexture({
        label: "rasterizerDepthTexture",
        size: [canvas.width, canvas.height],
        format: depthFormat,
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      });

      const rasterizer = createRasterizer({ device, colorFormat, depthFormat });

      const render = () => {
        const frame = frameRef.current;

        rasterizer.render({
          world: frame.world,
          camera: frame.camera,
          colorTarget: context.getCurrentTexture().createView(),
          depthTarget: depthTexture.createView(),
          width: canvas.width,
          height: canvas.height,
        });
      };

      const resources: RasterizerCanvasResources = {
        render,
        destroy: () => {
          rasterizer.destroy();
          depthTexture.destroy();
          device.destroy();
        },
      };

      if (disposed) {
        resources.destroy();
        return;
      }

      resourcesRef.current = resources;
      render();
    })();

    return () => {
      disposed = true;
      resourcesRef.current?.destroy();
      resourcesRef.current = null;
    };
  }, []);

  useEffect(() => {
    resourcesRef.current?.render();
  }, [camera, world]);

  return <canvas ref={canvasRef} width="640" height="480" />;
};
