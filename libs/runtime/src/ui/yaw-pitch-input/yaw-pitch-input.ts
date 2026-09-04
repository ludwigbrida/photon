import { derived, type Grain } from "@grainular/grains";
import { attr, html, on } from "@grainular/nord";
import { degrees, radians } from "@photon/core";
import type { CameraYawPitch } from "../../camera/orientation.ts";

type Angle = "yawRadians" | "pitchRadians";

type YawPitchInputProps = {
  readonly value: Grain<CameraYawPitch>;
  readonly disabled: Grain<boolean>;
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
  const angleDegrees = derived(value, (orientation) => degrees(orientation[angle]));

  return html`
    <span class="text-text-muted">${label}</span>
    <input
      class="h-7 w-20 border border-border bg-transparent px-2 focus:outline-2 focus:outline-offset-2 focus-visible:outline-focus disabled:opacity-40"
      type="number"
      step="any"
      ${attr({ value: angleDegrees, disabled })}
      ${on("change", (event) => {
        const nextValue = (event.currentTarget as HTMLInputElement).valueAsNumber;

        if (Number.isFinite(nextValue)) {
          onChange(updateAngle(value(), angle, nextValue));
        }
      })}
    />
  `;
};

export const YawPitchInput = ({ value, disabled, onChange }: YawPitchInputProps) => html`
  <div class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
    ${AngleInput({ angle: "yawRadians", label: "Yaw", value, disabled, onChange })}
    ${AngleInput({ angle: "pitchRadians", label: "Pitch", value, disabled, onChange })}
  </div>
`;
