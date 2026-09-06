import { html, type PropsWithChildren } from "@grainular/nord";
import styles from "./field.module.css";

type FieldProps = PropsWithChildren<{
  label: string;
  unit?: string;
}>;

export const Field = ({ label, children, unit }: FieldProps) => {
  return html`
    <div>
      <span class="${styles.label}">${label}</span>
      <span class="${styles.value}">${children}</span>
      <span class="${styles.label}">${unit}</span>
    </div>
  `;
};
