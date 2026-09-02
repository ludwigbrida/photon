import type { Grain } from "@grainular/grains";
import { html } from "@grainular/nord";
import type { RenderScheduling } from "@photon/renderer";
import { RenderConfigPanel } from "./panels/render-config/render-config-panel.ts";

type SidebarProps = {
  readonly ready: Grain<boolean>;
  readonly maxSamples: Grain<number>;
  readonly scheduling: Grain<RenderScheduling>;
  readonly isRendering: Grain<boolean>;
  readonly isComplete: Grain<boolean>;
  readonly onStart: () => void;
  readonly onStop: () => void;
  readonly onMaxSamplesChange: (maxSamples: number) => void;
  readonly onGpuBudgetChange: (gpuBudget: number) => void;
};

export const Sidebar = (props: SidebarProps) => html`
  <aside class="flex w-56 shrink-0 flex-col gap-4 border-l border-border p-3">
    <h2 class="font-semibold tracking-wide">Render</h2>
    ${RenderConfigPanel(props)}
  </aside>
`;
