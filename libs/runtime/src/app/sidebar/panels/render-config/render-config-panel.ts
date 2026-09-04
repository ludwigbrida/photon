import { derived, type Grain } from "@grainular/grains";
import { html } from "@grainular/nord";
import type { Vector3 } from "@photon/core";
import type { CameraYawPitch } from "../../../../camera/orientation.ts";
import { NumberInput } from "../../../../ui/number-input/number-input.ts";
import { Vector3Input } from "../../../../ui/vector3-input/vector3-input.ts";
import { YawPitchInput } from "../../../../ui/yaw-pitch-input/yaw-pitch-input.ts";

export type RenderConfigPanelProps = {
  readonly ready: Grain<boolean>;
  readonly gpuBudget: Grain<number>;
  readonly cameraPosition: Grain<Vector3>;
  readonly cameraYawPitch: Grain<CameraYawPitch>;
  readonly onGpuBudgetChange: (gpuBudget: number) => void;
  readonly onCameraPositionChange: (position: Vector3) => void;
  readonly onCameraYawPitchChange: (yawPitch: CameraYawPitch) => void;
};

export const RenderConfigPanel = ({
  ready,
  gpuBudget,
  cameraPosition,
  cameraYawPitch,
  onGpuBudgetChange,
  onCameraPositionChange,
  onCameraYawPitchChange,
}: RenderConfigPanelProps) => {
  const gpuBudgetPercent = derived(gpuBudget, (value) => Math.round(value * 100));
  const actionDisabled = derived(ready, (value) => !value);
  return html`
    <div class="flex min-h-0 flex-1 flex-col">
      <details class="group border-b border-border" open>
        <summary class="flex items-center justify-between px-4 py-2 leading-6">
          <h3 class="font-medium tracking-wider">CAMERA</h3>
          <span class="text-text-muted group-open:hidden">+</span>
          <span class="hidden text-text-muted group-open:inline">−</span>
        </summary>
        <div class="space-y-2.5 border-t border-border p-4">
          <div class="flex items-start justify-between gap-4">
            <span class="pt-1.5 text-text-muted">Position</span>
            ${Vector3Input({
              value: cameraPosition,
              disabled: actionDisabled,
              onChange: onCameraPositionChange,
            })}
          </div>
          <div class="flex items-start justify-between gap-4">
            <span class="pt-1.5 text-text-muted">Rotation</span>
            ${YawPitchInput({
              value: cameraYawPitch,
              disabled: actionDisabled,
              onChange: onCameraYawPitchChange,
            })}
          </div>
        </div>
      </details>

      <details class="group border-b border-border" open>
        <summary class="flex items-center justify-between px-4 py-2 leading-6">
          <h3 class="font-medium tracking-wider">QUALITY</h3>
          <span class="text-text-muted group-open:hidden">+</span>
          <span class="hidden text-text-muted group-open:inline">−</span>
        </summary>
        <div class="space-y-2.5 border-t border-border p-4">
          <label class="flex items-center justify-between gap-4">
            <span class="text-text-muted">GPU budget</span>
            ${NumberInput({
              value: gpuBudgetPercent,
              disabled: actionDisabled,
              onChange: (value) => onGpuBudgetChange(value / 100),
            })}
          </label>
        </div>
      </details>
    </div>
  `;
};
