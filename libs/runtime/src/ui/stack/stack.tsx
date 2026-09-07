import { Fragment, type ReactNode } from "react";
import { Separator } from "../separator/separator.tsx";
import styles from "./stack.module.css";

type StackProps = {
  children: ReactNode[];
};

export const Stack = ({ children }: StackProps) => (
  <div className={styles.stack}>
    {children.map((item, index) => (
      <Fragment key={index}>
        {index > 0 && <Separator />}
        {item}
      </Fragment>
    ))}
  </div>
);
