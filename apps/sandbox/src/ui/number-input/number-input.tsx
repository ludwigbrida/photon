import type { ChangeEventHandler } from "react";

type NumberInputProps = {
  readonly value: number;
  readonly disabled: boolean;
  readonly onChange: (value: number) => void;
};

export const NumberInput = ({ value, disabled, onChange }: NumberInputProps) => {
  const handleChange: ChangeEventHandler<HTMLInputElement> = ({ currentTarget }) => {
    const nextValue = currentTarget.valueAsNumber;

    if (Number.isInteger(nextValue) && nextValue > 0) {
      onChange(nextValue);
    }
  };

  return (
    <input
      className="h-7 w-20 border border-border bg-transparent px-2 focus:outline-2 focus:outline-offset-2 focus:outline-focus disabled:opacity-40"
      type="number"
      min={1}
      step={1}
      value={value}
      disabled={disabled}
      onChange={handleChange}
    />
  );
};
