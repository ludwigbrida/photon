import type { Environment } from "@photon/renderer";
import { useContext } from "react";
import { ColorField } from "../../../ui/color-field/color-field.tsx";
import { Field } from "../../../ui/field/field.tsx";
import { NumberField } from "../../../ui/number-field/number-field.tsx";
import { Stack } from "../../../ui/stack/stack.tsx";
import { EnvironmentContext } from "../../environment-context.tsx";
import styles from "./sky-section.module.css";

export const SkySection = () => {
  const { environment, updateEnvironment } = useContext(EnvironmentContext);

  const updateSky = (update: Partial<Environment["sky"]>) =>
    updateEnvironment((current) => ({
      ...current,
      sky: {
        ...current.sky,
        ...update,
      },
    }));

  return (
    <div className={styles.root}>
      <Stack orientation="vertical">
        <Field label="Zenith color">
          <ColorField
            value={environment.sky.zenithColor}
            onChange={(zenithColor) => updateSky({ zenithColor })}
          />
        </Field>
        <Field label="Horizon color">
          <ColorField
            value={environment.sky.horizonColor}
            onChange={(horizonColor) => updateSky({ horizonColor })}
          />
        </Field>
        <Field label="Horizon falloff">
          <NumberField
            value={environment.sky.horizonFalloff}
            min={0}
            onChange={(horizonFalloff) => updateSky({ horizonFalloff })}
          />
        </Field>
      </Stack>
    </div>
  );
};
