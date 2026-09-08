import type { Color } from "@photon/core";
import { NumberField } from "../number-field/number-field.tsx";
import styles from "./color-field.module.css";

type Channel = 0 | 1 | 2;

type ColorFieldProps = {
  readonly value: Color;
  readonly disabled?: boolean;
  readonly onChange: (value: Color) => void;
};

const CHANNELS = ["R", "G", "B"] as const;

const updateChannel = (color: Color, channel: Channel, value: number): Color => {
  const next: [number, number, number] = [...color];
  next[channel] = value;

  return next;
};

export const ColorField = ({ value, disabled = false, onChange }: ColorFieldProps) => (
  <div className={styles.root}>
    {CHANNELS.map((label, channel) => (
      <div key={label} className={styles.channel}>
        <span className={styles.label}>{label}</span>
        <NumberField
          value={value[channel]}
          min={0}
          max={1}
          disabled={disabled}
          onChange={(nextValue) => onChange(updateChannel(value, channel as Channel, nextValue))}
        />
      </div>
    ))}
  </div>
);
