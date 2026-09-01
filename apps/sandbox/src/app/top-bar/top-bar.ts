import { derived, type Grain } from "@grainular/grains";
import { attr, html } from "@grainular/nord";
import packageJson from "../../../package.json";

type TopBarProps = {
  readonly isRendering: Grain<boolean>;
};

export const TopBar = ({ isRendering }: TopBarProps) => {
  const statusClass = derived(isRendering, (value) =>
    value
      ? "font-medium uppercase tracking-wide text-status"
      : "font-medium uppercase tracking-wide text-text-muted",
  );
  const statusLabel = derived(isRendering, (value) => (value ? "Rendering" : "Stopped"));

  return html`
    <header class="flex h-7 shrink-0 items-center justify-between border-b border-border px-3">
      <h1 class="font-semibold tracking-wide">
        🌈 Photon <span class="font-normal text-text-muted">v${packageJson.version}</span>
      </h1>
      <span ${attr({ class: statusClass })}>${statusLabel}</span>
    </header>
  `;
};
