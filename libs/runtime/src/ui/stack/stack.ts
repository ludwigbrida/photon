import { derived } from "@grainular/grains";
import { $each, $if, type Fragment, html } from "@grainular/nord";
import styles from "./stack.module.css";

type StackProps = {
  items: Fragment[];
};

export const Stack = ({ items }: StackProps) => {
  return html`
    <div class="${styles.stack}">
      ${$each(() => items).$as((item, index) => {
        const isSuccessor = derived(index, (index) => index > 0);

        return html`
          ${$if(isSuccessor).$then(() => html`<span class="${styles.divider}"></span>`)} ${item}
        `;
      })}
    </div>
  `;
};
