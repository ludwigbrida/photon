import type { Environment } from "@photon/renderer";
import { useContext } from "react";
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
          <Stack orientation="horizontal" equal>
            <NumberField
              value={environment.sun.color[0]}
              min={0}
              max={1}
              onChange={(red) =>
                updateSun({ color: [red, environment.sun.color[1], environment.sun.color[2]] })
              }
            />
            <NumberField
              value={environment.sun.color[1]}
              min={0}
              max={1}
              onChange={(green) =>
                updateSun({ color: [environment.sun.color[0], green, environment.sun.color[2]] })
              }
            />
            <NumberField
              value={environment.sun.color[2]}
              min={0}
              max={1}
              onChange={(blue) =>
                updateSun({ color: [environment.sun.color[0], environment.sun.color[1], blue] })
              }
            />
          </Stack>
        </Field>
      </Stack>
    </div>
  );
};
