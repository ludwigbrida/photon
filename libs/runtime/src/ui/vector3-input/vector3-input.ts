import { derived, type Grain } from "@grainular/grains";
import { attr, html, on } from "@grainular/nord";
import type { Vector3 } from "@photon/core";

type Axis = 0 | 1 | 2;

type Vector3InputProps = {
  readonly value: Grain<Vector3>;
  readonly disabled: Grain<boolean>;
  readonly onChange: (value: Vector3) => void;
};

const updateAxis = (vector: Vector3, axis: Axis, value: number): Vector3 => {
  const next: [number, number, number] = [...vector];
  next[axis] = value;

  return next;
};

type AxisInputProps = Vector3InputProps & {
  readonly axis: Axis;
  readonly label: "X" | "Y" | "Z";
};

const AxisInput = ({ axis, label, value, disabled, onChange }: AxisInputProps) => {
  const axisValue = derived(value, (vector) => vector[axis]);

  return html`
    <span class="text-text-muted">${label}</span>
    <input
      class="h-7 w-20 border border-border bg-transparent px-2 focus:outline-2 focus:outline-offset-2 focus-visible:outline-focus disabled:opacity-40"
      type="number"
      step="any"
      ${attr({ value: axisValue, disabled })}
      ${on("change", (event) => {
        const nextValue = (event.currentTarget as HTMLInputElement).valueAsNumber;

        if (Number.isFinite(nextValue)) {
          onChange(updateAxis(value(), axis, nextValue));
        }
      })}
    />
  `;
};

export const Vector3Input = ({ value, disabled, onChange }: Vector3InputProps) => html`
  <div class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
    ${AxisInput({ axis: 0, label: "X", value, disabled, onChange })}
    ${AxisInput({ axis: 1, label: "Y", value, disabled, onChange })}
    ${AxisInput({ axis: 2, label: "Z", value, disabled, onChange })}
  </div>
`;
