import { Separator as BaseSeparator } from "@base-ui/react";
import styles from "./separator.module.css";

export const Separator = () => {
  return <BaseSeparator className={styles.root} orientation="vertical" />;
};
