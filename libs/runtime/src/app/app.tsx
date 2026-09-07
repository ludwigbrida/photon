import { useEffect, useRef, useState } from "react";
import { createCameraNavigation } from "../camera/navigation.ts";
import { directionFromYawPitch } from "../camera/orientation.ts";
import type { RuntimeController } from "../controller.ts";
import styles from "./app.module.css";
import { FooterPanel } from "./footer-panel/footer-panel.tsx";
import { HeaderPanel } from "./header-panel/header-panel.tsx";
import { ScenePanel } from "./scene-panel/scene-panel.tsx";
import { Sidebar } from "./sidebar/sidebar.tsx";
import { Viewport } from "./viewport/viewport.tsx";

type AppProps = {
  readonly controller: RuntimeController;
};

export const App = ({ controller }: AppProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef(controller.initialCamera);
  const [camera, setCameraState] = useState(controller.initialCamera);
  const [gpuBudget, setGpuBudget] = useState(controller.initialGpuBudget);
  const [telemetry, setTelemetry] = useState(controller.initialTelemetry);
  const [ready, setReady] = useState(false);
  const [isHeaderPanelVisible, setHeaderPanelVisible] = useState(true);
  const [isScenePanelVisible, setScenePanelVisible] = useState(true);
  const [isContextPanelVisible, setContextPanelVisible] = useState(true);
  const [isFooterPanelVisible, setFooterPanelVisible] = useState(true);
  const updateCamera = (updater: (current: typeof camera) => typeof camera) =>
    setCameraState((current) => {
      const next = updater(current);
      cameraRef.current = next;
      return next;
    });

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const unmountRenderer = controller.mountCanvas(canvas, {
      camera: cameraRef.current,
      gpuBudget,
      onTelemetryChange: setTelemetry,
      onReadyChange: setReady,
    });

    const unmountCameraNavigation = createCameraNavigation({
      getCamera: () => cameraRef.current,
      updateCamera,
    })(canvas);

    return () => {
      unmountCameraNavigation();
      unmountRenderer();
    };
  }, [controller]);

  useEffect(() => controller.configure({ camera, gpuBudget }), [camera, controller, gpuBudget]);

  return (
    <div className={styles.root}>
      <HeaderPanel visible={isHeaderPanelVisible} />
      <ScenePanel visible={isScenePanelVisible} />
      <Viewport
        canvasRef={canvasRef}
        telemetry={telemetry}
        ready={ready}
        headerPanelVisible={isHeaderPanelVisible}
        scenePanelVisible={isScenePanelVisible}
        contextPanelVisible={isContextPanelVisible}
        footerPanelVisible={isFooterPanelVisible}
        onStart={controller.start}
        onStop={controller.stop}
        onReset={controller.reset}
        onHeaderPanelVisibleChange={() => setHeaderPanelVisible((visible) => !visible)}
        onScenePanelVisibleChange={() => setScenePanelVisible((visible) => !visible)}
        onContextPanelVisibleChange={() => setContextPanelVisible((visible) => !visible)}
        onFooterPanelVisibleChange={() => setFooterPanelVisible((visible) => !visible)}
      />
      <Sidebar
        ready={ready}
        visible={isContextPanelVisible}
        gpuBudget={gpuBudget}
        camera={camera}
        onGpuBudgetChange={setGpuBudget}
        onCameraPositionChange={(position) => updateCamera((current) => ({ ...current, position }))}
        onCameraYawPitchChange={(yawPitch) =>
          updateCamera((current) => ({ ...current, direction: directionFromYawPitch(yawPitch) }))
        }
      />
      <FooterPanel ready={ready} visible={isFooterPanelVisible} />
    </div>
  );
};
