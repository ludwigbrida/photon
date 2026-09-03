import { derived, type Grain } from "@grainular/grains";
import { attr, html } from "@grainular/nord";

type ProgressProps = {
  readonly value: Grain<number>;
  readonly max: Grain<number>;
};

export const Progress = ({ value, max }: ProgressProps) => {
  const width = derived(value, (current) => `${Math.min((current / max()) * 100, 100)}%`);

  return html`
    <div
      class="h-1 overflow-hidden bg-border"
      role="progressbar"
      ${attr({ "aria-valuenow": value, "aria-valuemax": max })}
    >
      <div
        class="h-full bg-accent"
        ${attr({ style: derived(width, (value) => `width: ${value}`) })}
      ></div>
    </div>
  `;
};
