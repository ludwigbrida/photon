import { derived } from "@grainular/grains";
import { createRef, html } from "@grainular/nord";
import { createCameraNavigation } from "../camera/navigation.ts";
import { directionFromYawPitch, yawPitchFromDirection } from "../camera/orientation.ts";
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
  const mountCameraNavigation = createCameraNavigation(controller.camera);

  const isRendering = derived(controller.telemetry, ({ isRunning }) => isRunning);
  const isComplete = derived(
    controller.telemetry,
    ({ sampleCount, maxSamples }) => sampleCount >= maxSamples,
  );
  const cameraPosition = derived(controller.camera, ({ position }) => position);
  const cameraYawPitch = derived(controller.camera, ({ direction }) =>
    yawPitchFromDirection(direction),
  );

  return html`
    <main class="flex h-full flex-col">
      ${TopBar({
        isRendering,
      })}
      <div class="flex min-h-0 flex-1">
        ${Viewport({
          canvasRef,
          onMount: () => {
            const unmountRenderer = controller.mountCanvas(canvasRef.current!);
            const unmountCameraNavigation = mountCameraNavigation(canvasRef.current!);

            return () => {
              unmountCameraNavigation();
              unmountRenderer();
            };
          },
        })}
        ${Sidebar({
          ready: controller.ready,
          gpuBudget: controller.gpuBudget,
          isRendering,
          isComplete,
          cameraPosition,
          cameraYawPitch,
          onStart: controller.start,
          onStop: controller.stop,
          onGpuBudgetChange: controller.gpuBudget.set,
          onCameraPositionChange: (position) =>
            controller.camera.update((current) => ({ ...current, position })),
          onCameraYawPitchChange: (yawPitch) =>
            controller.camera.update((current) => ({
              ...current,
              direction: directionFromYawPitch(yawPitch),
            })),
        })}
      </div>
      ${StatusBar({
        telemetry: controller.telemetry,
      })}
    </main>
  `;
};
