import clsx from "clsx";
import { Fragment, type ReactNode } from "react";
import { Separator } from "../separator/separator.tsx";
import styles from "./stack.module.css";

type StackProps = {
  orientation?: "horizontal" | "vertical";
  children: ReactNode[];
};

export const Stack = ({ orientation = "horizontal", children }: StackProps) => (
  <div
    className={clsx(styles.stack, {
      [styles.horizontal]: orientation === "horizontal",
      [styles.vertical]: orientation === "vertical",
    })}
  >
    {children.map((item, index) => (
      <Fragment key={index}>
        {index > 0 && <Separator />}
        {item}
      </Fragment>
    ))}
  </div>
);
