import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import styles from "./number-field.module.css";

type NumberFieldProps = {
  readonly min?: number;
  readonly max?: number;
  readonly step?: number | "any";
  readonly disabled?: boolean;
  readonly value: number;
  readonly onChange: (value: number) => void;
};

export const NumberField = ({
  min,
  max,
  step = "any",
  disabled = false,
  value,
  onChange,
}: NumberFieldProps) => (
  <BaseNumberField.Root
    min={min}
    max={max}
    step={step}
    disabled={disabled}
    value={value}
    onValueChange={(nextValue) => {
      if (typeof nextValue === "number" && Number.isFinite(nextValue)) {
        onChange(nextValue);
      }
    }}
  >
    <BaseNumberField.Input className={styles.root} />
  </BaseNumberField.Root>
);
