import type { Grain } from "@grainular/grains";
import { attr, html, on } from "@grainular/nord";

type NumberInputProps = {
  readonly value: Grain<number>;
  readonly disabled: Grain<boolean>;
  readonly onChange: (value: number) => void;
};

export const NumberInput = ({ value, disabled, onChange }: NumberInputProps) => html`
  <input
    class="h-8 w-26.5 border border-input-border bg-surface-recessed px-2.5 text-right text-input-text focus:outline-2 focus:outline-offset-2 focus:outline-focus disabled:opacity-40"
    type="number"
    min="1"
    step="1"
    ${attr({ value, disabled })}
    ${on("change", (event) => {
      const nextValue = (event.currentTarget as HTMLInputElement).valueAsNumber;

      if (Number.isInteger(nextValue) && nextValue > 0) {
        onChange(nextValue);
      }
    })}
  />
`;
