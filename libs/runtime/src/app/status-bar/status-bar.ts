import { derived, type Grain } from "@grainular/grains";
import { attr, html } from "@grainular/nord";

type StatusBarProps = {
  readonly ready: Grain<boolean>;
};

export const StatusBar = ({ ready }: StatusBarProps) => {
  const deviceStatus = derived(ready, (value) => (value ? "READY" : "INITIALIZING"));
  const deviceStatusClass = derived(ready, (value) =>
    value ? "flex items-center gap-2.5 text-status" : "flex items-center gap-2.5 text-status-muted",
  );

  return html`
    <footer
      class="flex shrink-0 items-center gap-4 border-t border-border bg-surface px-4 py-2 leading-6 text-status-muted"
    >
      <span>GPU <span class="text-status-value">--</span></span>
      <span class="h-4 w-px bg-border"></span>
      <span>API <span class="text-status-value">WEBGPU</span></span>
      <span class="h-4 w-px bg-border"></span>
      <span>VRAM <span class="text-status-value">--</span></span>
      <span class="h-4 w-px bg-border"></span>
      <span>FPS <span class="text-status-value">--</span></span>
      <span class="h-4 w-px bg-border"></span>
      <span>FRAME <span class="text-status-value">--</span><span>ms</span></span>
      <button class="ml-auto border border-transparent text-status-muted" type="button">
        ERRORS <span class="text-status-value">--</span>
      </button>
      <span class="h-4 w-px bg-border"></span>
      <span ${attr({ class: deviceStatusClass })}>
        <span class="h-2 w-2 bg-current"></span>
        <span>${deviceStatus}</span>
      </span>
    </footer>
  `;
};
