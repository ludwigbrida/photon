import type { Vector3 } from "@photon/core";
import styles from "./vector3-input.module.css";

type Axis = 0 | 1 | 2;

type Vector3InputProps = {
  readonly value: Vector3;
  readonly disabled: boolean;
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
  return (
    <>
      <span className={styles.label}>{label}</span>
      <input
        className={styles.input}
        type="number"
        step="any"
        value={value[axis]}
        disabled={disabled}
        onChange={(event) => {
          const nextValue = (event.currentTarget as HTMLInputElement).valueAsNumber;
          if (Number.isFinite(nextValue)) {
            onChange(updateAxis(value, axis, nextValue));
          }
        }}
      />
    </>
  );
};

export const Vector3Input = ({ value, disabled, onChange }: Vector3InputProps) => (
  <div className={styles.root}>
    <AxisInput axis={0} label="X" value={value} disabled={disabled} onChange={onChange} />
    <AxisInput axis={1} label="Y" value={value} disabled={disabled} onChange={onChange} />
    <AxisInput axis={2} label="Z" value={value} disabled={disabled} onChange={onChange} />
  </div>
);
