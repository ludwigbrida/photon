import styles from "./number-input.module.css";

type NumberInputProps = {
  readonly value: number;
  readonly onChange: (value: number) => void;
};

export const NumberInput = ({ value, onChange }: NumberInputProps) => (
  <input
    className={styles.root}
    type="number"
    min="1"
    step="1"
    value={value}
    onChange={(event) => {
      const nextValue = (event.currentTarget as HTMLInputElement).valueAsNumber;
      if (Number.isInteger(nextValue) && nextValue > 0) {
        onChange(nextValue);
      }
    }}
  />
);
