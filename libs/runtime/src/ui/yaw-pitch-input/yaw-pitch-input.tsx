import { degrees, radians } from "@photon/core";
import type { CameraYawPitch } from "../../camera/orientation.ts";
import styles from "./yaw-pitch-input.module.css";

type Angle = "yawRadians" | "pitchRadians";

type YawPitchInputProps = {
  readonly value: CameraYawPitch;
  readonly disabled: boolean;
  readonly onChange: (value: CameraYawPitch) => void;
};

const updateAngle = (value: CameraYawPitch, angle: Angle, degrees: number): CameraYawPitch => ({
  ...value,
  [angle]: radians(degrees),
});

type AngleInputProps = YawPitchInputProps & {
  readonly angle: Angle;
  readonly label: "Yaw" | "Pitch";
};

const AngleInput = ({ angle, label, value, disabled, onChange }: AngleInputProps) => {
  return (
    <>
      <span className={styles.label}>{label}</span>
      <input
        className={styles.input}
        type="number"
        step="any"
        value={degrees(value[angle])}
        disabled={disabled}
        onChange={(event) => {
          const nextValue = (event.currentTarget as HTMLInputElement).valueAsNumber;
          if (Number.isFinite(nextValue)) {
            onChange(updateAngle(value, angle, nextValue));
          }
        }}
      />
    </>
  );
};

export const YawPitchInput = ({ value, disabled, onChange }: YawPitchInputProps) => (
  <div className={styles.root}>
    <AngleInput
      angle="yawRadians"
      label="Yaw"
      value={value}
      disabled={disabled}
      onChange={onChange}
    />
    <AngleInput
      angle="pitchRadians"
      label="Pitch"
      value={value}
      disabled={disabled}
      onChange={onChange}
    />
  </div>
);
