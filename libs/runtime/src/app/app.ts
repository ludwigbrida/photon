import { derived } from "@grainular/grains";
import { createRef, html } from "@grainular/nord";
import type { RuntimeController } from "../controller.ts";
import { Sidebar } from "./sidebar/sidebar.ts";
import { StatusBar } from "./status-bar/status-bar.ts";
import { TopBar } from "./top-bar/top-bar.ts";
import { Viewport } from "./viewport/viewport.ts";

type AppProps = {
  readonly controller: RuntimeController;
};

export const App = ({ controller }: AppProps) => {
  const canvasRef = createRef<HTMLCanvasElement>();

  const isRendering = derived(controller.telemetry, ({ isRunning }) => isRunning);
  const isComplete = derived(
    controller.telemetry,
    ({ sampleCount, maxSamples }) => sampleCount >= maxSamples,
  );
  const cameraPosition = derived(controller.camera, ({ position }) => position);

  return html`
    <main class="flex h-full flex-col">
      ${TopBar({
        isRendering,
      })}
      <div class="flex min-h-0 flex-1">
        ${Viewport({
          canvasRef,
          onMount: () => controller.mountCanvas(canvasRef.current!),
        })}
        ${Sidebar({
          ready: controller.ready,
          gpuBudget: controller.gpuBudget,
          isRendering,
          isComplete,
          cameraPosition,
          onStart: controller.start,
          onStop: controller.stop,
          onGpuBudgetChange: controller.gpuBudget.set,
          onCameraPositionChange: (position) =>
            controller.camera.update((current) => ({ ...current, position })),
        })}
      </div>
      ${StatusBar({
        telemetry: controller.telemetry,
      })}
    </main>
  `;
};
