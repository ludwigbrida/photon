import { useState } from "react";
import { Field } from "../../../ui/field/field.tsx";
import { NumberField } from "../../../ui/number-field/number-field.tsx";
import { Stack } from "../../../ui/stack/stack.tsx";
import styles from "./sun-section.module.css";

export const SunSection = () => {
  const [azimuth, setAzimuth] = useState(0);
  const [elevation, setElevation] = useState(0);

  return (
    <div className={styles.root}>
      <Stack orientation="vertical">
        <Field label="Azimuth">
          <NumberField value={azimuth} onChange={setAzimuth} />
        </Field>
        <Field label="Elevation">
          <NumberField value={elevation} onChange={setElevation} />
        </Field>
      </Stack>
    </div>
  );
};
