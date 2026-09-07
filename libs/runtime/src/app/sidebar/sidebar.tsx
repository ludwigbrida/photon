import type { Vector3 } from "@photon/core";
import type { Camera } from "@photon/renderer";
import clsx from "clsx";
import type { CameraYawPitch } from "../../camera/orientation.ts";
import { RenderConfigPanel } from "./panels/render-config/render-config-panel.tsx";
import styles from "./sidebar.module.css";

type SidebarProps = {
  readonly ready: boolean;
  readonly visible: boolean;
  readonly gpuBudget: number;
  readonly camera: Camera;
  readonly onGpuBudgetChange: (gpuBudget: number) => void;
  readonly onCameraPositionChange: (position: Vector3) => void;
  readonly onCameraYawPitchChange: (yawPitch: CameraYawPitch) => void;
};

export const Sidebar = (props: SidebarProps) => (
  <aside className={clsx(styles.root, { [styles.hidden]: !props.visible })}>
    <div className={styles.header}>
      <h2 className={styles.title}>RENDER</h2>
    </div>
    <div className={styles.content}>
      <RenderConfigPanel {...props} />
    </div>
  </aside>
);
