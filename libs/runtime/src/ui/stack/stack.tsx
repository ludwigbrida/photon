import { Fragment, type ReactNode } from "react";
import styles from "./stack.module.css";

type StackProps = {
  items: ReactNode[];
};

export const Stack = ({ items }: StackProps) => (
  <div className={styles.stack}>
    {items.map((item, index) => (
      <Fragment key={index}>
        {index > 0 && <span className={styles.divider} />}
        {item}
      </Fragment>
    ))}
  </div>
);
