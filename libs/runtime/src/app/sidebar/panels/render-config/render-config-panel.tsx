import type { Vector3 } from "@photon/core";
import type { Camera } from "@photon/renderer";
import clsx from "clsx";
import type { CameraYawPitch } from "../../../../camera/orientation.ts";
import { yawPitchFromDirection } from "../../../../camera/orientation.ts";
import { NumberField } from "../../../../ui/number-field/number-field.tsx";
import { Vector3Input } from "../../../../ui/vector3-input/vector3-input.tsx";
import { YawPitchInput } from "../../../../ui/yaw-pitch-input/yaw-pitch-input.tsx";
import styles from "./render-config-panel.module.css";

export type RenderConfigPanelProps = {
  readonly ready: boolean;
  readonly gpuBudget: number;
  readonly camera: Camera;
  readonly onGpuBudgetChange: (gpuBudget: number) => void;
  readonly onCameraPositionChange: (position: Vector3) => void;
  readonly onCameraYawPitchChange: (yawPitch: CameraYawPitch) => void;
};

export const RenderConfigPanel = ({
  ready,
  gpuBudget,
  camera,
  onGpuBudgetChange,
  onCameraPositionChange,
  onCameraYawPitchChange,
}: RenderConfigPanelProps) => {
  const gpuBudgetPercent = Math.round(gpuBudget * 100);
  const cameraValue = camera;
  const actionDisabled = !ready;

  return (
    <div>
      <details className={styles.section} open>
        <summary className={styles.summary}>
          <h3 className={styles.sectionTitle}>CAMERA</h3>
          <span className={clsx(styles.toggle, styles.toggleClosed)}>+</span>
          <span className={clsx(styles.toggle, styles.toggleOpen)}>−</span>
        </summary>
        <div className={styles.content}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Position</span>
            <Vector3Input
              value={cameraValue.position}
              disabled={actionDisabled}
              onChange={onCameraPositionChange}
            />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Rotation</span>
            <YawPitchInput
              value={yawPitchFromDirection(cameraValue.direction)}
              disabled={actionDisabled}
              onChange={onCameraYawPitchChange}
            />
          </div>
        </div>
      </details>

      <details className={styles.section} open>
        <summary className={styles.summary}>
          <h3 className={styles.sectionTitle}>QUALITY</h3>
          <span className={clsx(styles.toggle, styles.toggleClosed)}>+</span>
          <span className={clsx(styles.toggle, styles.toggleOpen)}>−</span>
        </summary>
        <div className={styles.content}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>GPU budget</span>
            <NumberField
              value={gpuBudgetPercent}
              min={1}
              step={1}
              onChange={(value) => {
                if (Number.isInteger(value) && value > 0) {
                  onGpuBudgetChange(value / 100);
                }
              }}
            />
          </label>
        </div>
      </details>
    </div>
  );
};
