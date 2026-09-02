import { derived, type Grain } from "@grainular/grains";
import { html } from "@grainular/nord";
import type { RendererStats } from "@photon/renderer";
import { Progress } from "../../ui/progress/progress.ts";

type StatusBarProps = {
  readonly stats: Grain<RendererStats>;
};

export const StatusBar = ({ stats }: StatusBarProps) => {
  const sampleCount = derived(stats, ({ sampleCount: value }) => value);
  const maxSamples = derived(stats, ({ maxSamples: value }) => value);
  const elapsed = derived(stats, ({ elapsedMilliseconds }) =>
    (elapsedMilliseconds / 1000).toFixed(1),
  );
  const samplesPerSecond = derived(stats, ({ sampleCount, elapsedMilliseconds }) =>
    (sampleCount / Math.max(elapsedMilliseconds / 1000, 0.01)).toFixed(1),
  );
  const tileGrid = derived(
    stats,
    ({ scheduling: { bucketGridSize } }) => `${bucketGridSize}×${bucketGridSize}`,
  );

  return html`
    <footer
      class="flex h-7 shrink-0 items-center gap-3 border-t border-border px-3 text-text-muted"
    >
      <span>Samples ${sampleCount} / ${maxSamples}</span>
      <div class="w-40">${Progress({ value: sampleCount, max: maxSamples })}</div>
      <span>Samples/s ${samplesPerSecond}</span>
      <span>Tile grid ${tileGrid}</span>
      <span>Elapsed ${elapsed} s</span>
    </footer>
  `;
};
