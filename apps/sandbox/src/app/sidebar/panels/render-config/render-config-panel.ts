import { combined, derived, type Grain } from "@grainular/grains";
import { html } from "@grainular/nord";
import type { RenderScheduling } from "@photon/renderer";
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
  readonly onSchedulingChange: (scheduling: RenderScheduling) => void;
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
  onSchedulingChange,
}: RenderConfigPanelProps) => {
  const startDisabled = derived(
    combined([ready, isRendering, isComplete]),
    ([isReady, rendering, complete]) => !isReady || rendering || complete,
  );
  const batchSize = derived(scheduling, ({ bucketGridSize }) => bucketGridSize);

  return html`
    <section class="flex flex-col gap-3">
      <h3 class="font-medium uppercase tracking-wide text-text-muted">Configuration</h3>
      <label class="flex items-center justify-between gap-3">
        <span class="text-text-muted">Max samples</span>
        ${NumberInput({ value: maxSamples, disabled: derived(ready, (value) => !value), onChange: onMaxSamplesChange })}
      </label>
      <label class="flex items-center justify-between gap-3">
        <span class="text-text-muted">Batch size</span>
        ${NumberInput({
          value: batchSize,
          disabled: derived(ready, (value) => !value),
          onChange: (bucketGridSize) => onSchedulingChange({ bucketGridSize }),
        })}
      </label>
      <div class="flex gap-2">
        ${Button({ variant: "primary", onClick: onStart, disabled: startDisabled, children: "Start" })}
        ${Button({ onClick: onStop, disabled: derived(isRendering, (value) => !value), children: "Stop" })}
      </div>
    </section>
  `;
};
