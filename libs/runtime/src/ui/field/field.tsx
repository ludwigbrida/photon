import type { PropsWithChildren } from "react";
import styles from "./field.module.css";

type FieldProps = PropsWithChildren<{
  label: string;
  unit?: string;
}>;

export const Field = ({ label, children, unit }: FieldProps) => (
  <div>
    <span className={styles.label}>{label}</span> <span className={styles.value}>{children}</span>
    <span className={styles.label}>{unit}</span>
  </div>
);
