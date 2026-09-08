import type { Environment } from "@photon/renderer";
import { useContext } from "react";
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
          <Stack orientation="horizontal" equal>
            <NumberField
              value={environment.sky.zenithColor[0]}
              min={0}
              max={1}
              onChange={(red) =>
                updateSky({
                  zenithColor: [
                    red,
                    environment.sky.zenithColor[1],
                    environment.sky.zenithColor[2],
                  ],
                })
              }
            />
            <NumberField
              value={environment.sky.zenithColor[1]}
              min={0}
              max={1}
              onChange={(green) =>
                updateSky({
                  zenithColor: [
                    environment.sky.zenithColor[0],
                    green,
                    environment.sky.zenithColor[2],
                  ],
                })
              }
            />
            <NumberField
              value={environment.sky.zenithColor[2]}
              min={0}
              max={1}
              onChange={(blue) =>
                updateSky({
                  zenithColor: [
                    environment.sky.zenithColor[0],
                    environment.sky.zenithColor[1],
                    blue,
                  ],
                })
              }
            />
          </Stack>
        </Field>
        <Field label="Horizon color">
          <Stack orientation="horizontal" equal>
            <NumberField
              value={environment.sky.horizonColor[0]}
              min={0}
              max={1}
              onChange={(red) =>
                updateSky({
                  horizonColor: [
                    red,
                    environment.sky.horizonColor[1],
                    environment.sky.horizonColor[2],
                  ],
                })
              }
            />
            <NumberField
              value={environment.sky.horizonColor[1]}
              min={0}
              max={1}
              onChange={(green) =>
                updateSky({
                  horizonColor: [
                    environment.sky.horizonColor[0],
                    green,
                    environment.sky.horizonColor[2],
                  ],
                })
              }
            />
            <NumberField
              value={environment.sky.horizonColor[2]}
              min={0}
              max={1}
              onChange={(blue) =>
                updateSky({
                  horizonColor: [
                    environment.sky.horizonColor[0],
                    environment.sky.horizonColor[1],
                    blue,
                  ],
                })
              }
            />
          </Stack>
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
