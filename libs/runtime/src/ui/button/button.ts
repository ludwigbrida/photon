import type { Grain } from "@grainular/grains";
import { attr, html, on, type ComponentFragment } from "@grainular/nord";

type ButtonProps = {
  readonly children: string | Grain<string> | ComponentFragment;
  readonly disabled?: Grain<boolean>;
  readonly onClick?: () => void;
  readonly variant?: "primary" | "secondary";
};

export const Button = ({ variant = "secondary", children, disabled, onClick }: ButtonProps) => {
  const variantClass =
    variant === "primary"
      ? "border-action-border bg-action-surface text-action-text hover:border-accent-hover hover:bg-action-hover"
      : "border-border bg-surface hover:border-text-muted hover:bg-surface-recessed";

  return html`
    <button
      class="inline-flex items-center justify-center border px-2.5 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-40 ${variantClass}"
      type="button"
      ${attr({ disabled: disabled ?? false })}
      ${on("click", () => onClick?.())}
    >
      ${children}
    </button>
  `;
};
