import { Button as BaseButton } from "@base-ui/react/button";
import classNames from "classnames";
import type { MouseEventHandler, ReactNode } from "react";

type ButtonProps = {
  readonly children: ReactNode;
  readonly disabled?: boolean;
  readonly onClick?: MouseEventHandler<HTMLButtonElement>;
  readonly variant?: "primary" | "secondary";
};

export const Button = ({ variant = "secondary", ...props }: ButtonProps) => {
  return (
    <BaseButton
      className={classNames(
        "inline-flex h-7 items-center justify-center border px-2 text-xs font-medium rounded-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-40",
        {
          "border-accent text-accent hover:border-accent-hover hover:text-accent-hover":
            variant === "primary",
          "border-border hover:border-text-muted": variant === "secondary",
        },
      )}
      type="button"
      {...props}
    />
  );
};
