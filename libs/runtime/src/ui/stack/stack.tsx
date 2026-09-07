import clsx from "clsx";
import { Fragment, type ReactNode } from "react";
import { Separator } from "../separator/separator.tsx";
import styles from "./stack.module.css";

type StackProps = {
  orientation: "horizontal" | "vertical";
  separator?: boolean;
  equal?: boolean;
  children: ReactNode[];
};

export const Stack = ({ orientation, separator = false, equal = false, children }: StackProps) => (
  <div
    className={clsx(styles.stack, {
      [styles.horizontal]: orientation === "horizontal",
      [styles.vertical]: orientation === "vertical",
    })}
  >
    {children.map((item, index) => (
      <Fragment key={index}>
        {separator && index > 0 && <Separator />}
        <div
          className={clsx(styles.item, {
            [styles.equal]: equal,
          })}
        >
          {item}
        </div>
      </Fragment>
    ))}
  </div>
);
