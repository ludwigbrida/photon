import { Button as BaseButton } from "@base-ui/react/button";
import styles from "./button.module.css";

type ButtonProps = {
  readonly children: string;
  readonly disabled?: boolean;
  readonly onClick: () => void;
};

export const Button = ({ children, disabled, onClick }: ButtonProps) => {
  return (
    <BaseButton className={styles.root} disabled={disabled} onClick={onClick}>
      {children}
    </BaseButton>
  );
};
