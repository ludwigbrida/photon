import { derived, type Grain } from "@grainular/grains";
import { html } from "@grainular/nord";
import type { RendererStats } from "@photon/renderer";
import { Progress } from "../../ui/progress/progress.ts";
import { formatElapsed } from "../format-elapsed.ts";

type StatusBarProps = {
  readonly stats: Grain<RendererStats>;
};

export const StatusBar = ({ stats }: StatusBarProps) => {
  const sampleCount = derived(stats, ({ sampleCount: value }) => value);
  const maxSamples = derived(stats, ({ maxSamples: value }) => value);
  const elapsed = derived(stats, ({ elapsedMilliseconds }) => formatElapsed(elapsedMilliseconds));

  return html`
    <footer
      class="flex h-7 shrink-0 items-center gap-3 border-t border-border px-3 text-text-muted"
    >
      <span>Samples ${sampleCount} / ${maxSamples}</span>
      <div class="w-40">${Progress({ value: sampleCount, max: maxSamples })}</div>
      <span>Elapsed ${elapsed}</span>
    </footer>
  `;
};
