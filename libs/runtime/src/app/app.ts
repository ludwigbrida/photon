import { derived } from "@grainular/grains";
import { createRef, html } from "@grainular/nord";
import { createCameraNavigation } from "../camera/navigation.ts";
import { directionFromYawPitch, yawPitchFromDirection } from "../camera/orientation.ts";
import type { RuntimeController } from "../controller.ts";
import { SceneOutline } from "./scene-outline/scene-outline.ts";
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
  const cameraPosition = derived(controller.camera, ({ position }) => position);
  const cameraYawPitch = derived(controller.camera, ({ direction }) =>
    yawPitchFromDirection(direction),
  );

  return html`
    <main class="flex h-full flex-col">
      ${TopBar()}
      <div class="flex min-h-0 flex-1">
        ${SceneOutline()}
        ${Viewport({
          canvasRef,
          telemetry: controller.telemetry,
          ready: controller.ready,
          isRendering,
          onStart: controller.start,
          onStop: controller.stop,
          onReset: controller.reset,
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
          cameraPosition,
          cameraYawPitch,
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
      ${StatusBar({ ready: controller.ready })}
    </main>
  `;
};
