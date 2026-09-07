import { Field as BaseField } from "@base-ui/react";
import type { ReactNode } from "react";
import { Stack } from "../stack/stack.tsx";
import styles from "./field.module.css";

type FieldProps = {
  label: string;
  children: ReactNode;
};

export const Field = ({ label, children }: FieldProps) => {
  return (
    <BaseField.Root>
      <Stack orientation="horizontal" equal>
        <BaseField.Label className={styles.label}>{label}</BaseField.Label>
        {children}
      </Stack>
    </BaseField.Root>
  );
};
