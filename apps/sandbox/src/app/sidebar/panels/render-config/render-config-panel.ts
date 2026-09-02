import { combined, derived, type Grain } from "@grainular/grains";
import { html } from "@grainular/nord";
import { Projection, type RendererConfig, type RenderScheduling } from "@photon/renderer";
import { Button } from "../../../../ui/button/button.ts";
import { NumberInput } from "../../../../ui/number-input/number-input.ts";

export type RenderConfigPanelProps = {
  readonly ready: Grain<boolean>;
  readonly maxSamples: Grain<number>;
  readonly scheduling: Grain<RenderScheduling>;
  readonly isRendering: Grain<boolean>;
  readonly isComplete: Grain<boolean>;
  readonly onStart: () => void;
  readonly onStop: () => void;
  readonly onMaxSamplesChange: (maxSamples: number) => void;
  readonly onGpuBudgetChange: (gpuBudget: number) => void;
  readonly configure: (config: Partial<RendererConfig>) => void;
};

export const RenderConfigPanel = ({
  ready,
  maxSamples,
  scheduling,
  isRendering,
  isComplete,
  onStart,
  onStop,
  onMaxSamplesChange,
  onGpuBudgetChange,
  configure,
}: RenderConfigPanelProps) => {
  const startDisabled = derived(
    combined([ready, isRendering, isComplete]),
    ([isReady, rendering, complete]) => !isReady || rendering || complete,
  );
  const gpuBudget = derived(scheduling, ({ gpuBudget }) => Math.round(gpuBudget * 100));

  return html`
    <section class="flex flex-col gap-3">
      <h3 class="font-medium uppercase tracking-wide text-text-muted">Configuration</h3>
      <label class="flex items-center justify-between gap-3">
        <span class="text-text-muted">Max samples</span>
        ${NumberInput({ value: maxSamples, disabled: derived(ready, (value) => !value), onChange: onMaxSamplesChange })}
      </label>
      <label class="flex items-center justify-between gap-3">
        <span class="text-text-muted">GPU budget</span>
        ${NumberInput({
          value: gpuBudget,
          disabled: derived(ready, (value) => !value),
          onChange: (gpuBudget) => onGpuBudgetChange(gpuBudget / 100),
        })}
      </label>
      <div class="flex gap-2">
        ${Button({ variant: "primary", onClick: onStart, disabled: startDisabled, children: "Start" })}
        ${Button({ onClick: onStop, disabled: derived(isRendering, (value) => !value), children: "Stop" })}
        ${Button({
          onClick: () =>
            configure({
              camera: {
                projection: Projection.Perspective,
                position: [0, 0, -41],
                target: [0, 0, 0],
                verticalFov: 60,
              },
            }),
          disabled: derived(ready, (value) => !value),
          children: "Cam",
        })}
      </div>
    </section>
  `;
};
