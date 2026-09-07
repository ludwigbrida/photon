import type { PropsWithChildren } from "react";
import styles from "./metric.module.css";

type MetricProps = PropsWithChildren<{
  label: string;
  unit?: string;
}>;

export const Metric = ({ label, children, unit }: MetricProps) => (
  <div>
    <span className={styles.label}>{label}</span> <span className={styles.value}>{children}</span>
    <span className={styles.label}>{unit}</span>
  </div>
);
