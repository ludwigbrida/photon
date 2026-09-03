import { derived, type Grain } from "@grainular/grains";
import { html } from "@grainular/nord";
import type { RendererTelemetry } from "@photon/renderer";
import { Progress } from "../../ui/progress/progress.ts";

type StatusBarProps = {
  readonly telemetry: Grain<RendererTelemetry>;
};

export const StatusBar = ({ telemetry }: StatusBarProps) => {
  const sampleCount = derived(telemetry, ({ sampleCount: value }) => value);
  const maxSamples = derived(telemetry, ({ maxSamples: value }) => value);
  const elapsed = derived(telemetry, ({ elapsedMilliseconds }) =>
    (elapsedMilliseconds / 1000).toFixed(1),
  );
  const samplesPerSecond = derived(telemetry, ({ sampleCount, elapsedMilliseconds }) =>
    (sampleCount / Math.max(elapsedMilliseconds / 1000, 0.01)).toFixed(1),
  );
  const tileGrid = derived(
    telemetry,
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
