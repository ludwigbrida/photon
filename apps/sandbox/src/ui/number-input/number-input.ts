import type { Grain } from "@grainular/grains";
import { attr, html, on } from "@grainular/nord";

type NumberInputProps = {
  readonly value: Grain<number>;
  readonly disabled: Grain<boolean>;
  readonly onChange: (value: number) => void;
};

export const NumberInput = ({ value, disabled, onChange }: NumberInputProps) => html`
  <input
    class="h-7 w-20 border border-border bg-transparent px-2 focus:outline-2 focus:outline-offset-2 focus:outline-focus disabled:opacity-40"
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
