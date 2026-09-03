import { combined, derived, type Grain } from "@grainular/grains";
import { html } from "@grainular/nord";
import type { Vector3 } from "@photon/core";
import { Button } from "../../../../ui/button/button.ts";
import { NumberInput } from "../../../../ui/number-input/number-input.ts";
import { Vector3Input } from "../../../../ui/vector3-input/vector3-input.ts";

export type RenderConfigPanelProps = {
  readonly ready: Grain<boolean>;
  readonly gpuBudget: Grain<number>;
  readonly isRendering: Grain<boolean>;
  readonly isComplete: Grain<boolean>;
  readonly cameraPosition: Grain<Vector3>;
  readonly onStart: () => void;
  readonly onStop: () => void;
  readonly onGpuBudgetChange: (gpuBudget: number) => void;
  readonly onCameraPositionChange: (position: Vector3) => void;
};

export const RenderConfigPanel = ({
  ready,
  gpuBudget,
  isRendering,
  isComplete,
  cameraPosition,
  onStart,
  onStop,
  onGpuBudgetChange,
  onCameraPositionChange,
}: RenderConfigPanelProps) => {
  const startDisabled = derived(
    combined([ready, isRendering, isComplete]),
    ([isReady, rendering, complete]) => !isReady || rendering || complete,
  );
  const gpuBudgetPercent = derived(gpuBudget, (value) => Math.round(value * 100));

  return html`
    <section class="flex flex-col gap-3">
      <h3 class="font-medium uppercase tracking-wide text-text-muted">Configuration</h3>
      <label class="flex items-center justify-between gap-3">
        <span class="text-text-muted">GPU budget</span>
        ${NumberInput({
          value: gpuBudgetPercent,
          disabled: derived(ready, (value) => !value),
          onChange: (gpuBudget) => onGpuBudgetChange(gpuBudget / 100),
        })}
      </label>
      <div class="flex items-start justify-between gap-3">
        <span class="pt-1 text-text-muted">Camera position</span>
        ${Vector3Input({
          value: cameraPosition,
          disabled: derived(ready, (value) => !value),
          onChange: onCameraPositionChange,
        })}
      </div>
      <div class="flex gap-2">
        ${Button({ variant: "primary", onClick: onStart, disabled: startDisabled, children: "Start" })}
        ${Button({ onClick: onStop, disabled: derived(isRendering, (value) => !value), children: "Stop" })}
      </div>
    </section>
  `;
};
