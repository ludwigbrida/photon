import clsx from "clsx";
import styles from "./button.module.css";

type ButtonProps = {
  readonly children: string;
  readonly disabled?: boolean;
  readonly inline?: boolean;
  readonly onClick?: () => void;
};

export const Button = ({ children, disabled, inline = false, onClick }: ButtonProps) => {
  return (
    <button
      className={clsx(styles.root, { [styles.inline]: inline })}
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
