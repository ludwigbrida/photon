import type { Grain } from "@grainular/grains";
import { attr, html, on, type ComponentFragment } from "@grainular/nord";

type ButtonProps = {
  readonly children: string | ComponentFragment;
  readonly disabled?: Grain<boolean>;
  readonly onClick?: () => void;
  readonly variant?: "primary" | "secondary";
};

export const Button = ({ variant = "secondary", children, disabled, onClick }: ButtonProps) => {
  const variantClass =
    variant === "primary"
      ? "border-accent text-accent hover:border-accent-hover hover:text-accent-hover"
      : "border-border hover:border-text-muted";

  return html`
    <button
      class="inline-flex h-7 items-center justify-center rounded-none border px-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-40 ${variantClass}"
      type="button"
      ${attr({ disabled: disabled ?? false })}
      ${on("click", () => onClick?.())}
    >
      ${children}
    </button>
  `;
};
