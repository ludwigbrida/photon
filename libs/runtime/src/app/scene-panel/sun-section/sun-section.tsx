import type { Environment } from "@photon/renderer";
import { useContext } from "react";
import { ColorField } from "../../../ui/color-field/color-field.tsx";
import { Field } from "../../../ui/field/field.tsx";
import { NumberField } from "../../../ui/number-field/number-field.tsx";
import { Stack } from "../../../ui/stack/stack.tsx";
import { EnvironmentContext } from "../../environment-context.tsx";
import styles from "./sun-section.module.css";

export const SunSection = () => {
  const { environment, updateEnvironment } = useContext(EnvironmentContext);

  const updateSun = (update: Partial<Environment["sun"]>) =>
    updateEnvironment((current) => ({
      ...current,
      sun: {
        ...current.sun,
        ...update,
      },
    }));

  return (
    <div className={styles.root}>
      <Stack orientation="vertical">
        <Field label="Azimuth">
          <NumberField
            value={environment.sun.azimuthDegrees}
            onChange={(azimuthDegrees) => updateSun({ azimuthDegrees })}
          />
        </Field>
        <Field label="Elevation">
          <NumberField
            value={environment.sun.elevationDegrees}
            onChange={(elevationDegrees) => updateSun({ elevationDegrees })}
          />
        </Field>
        <Field label="Angular radius">
          <NumberField
            value={environment.sun.angularRadiusDegrees}
            min={0}
            onChange={(angularRadiusDegrees) => updateSun({ angularRadiusDegrees })}
          />
        </Field>
        <Field label="Intensity">
          <NumberField
            value={environment.sun.intensity}
            min={0}
            onChange={(intensity) => updateSun({ intensity })}
          />
        </Field>
        <Field label="Color">
          <ColorField value={environment.sun.color} onChange={(color) => updateSun({ color })} />
        </Field>
      </Stack>
    </div>
  );
};
