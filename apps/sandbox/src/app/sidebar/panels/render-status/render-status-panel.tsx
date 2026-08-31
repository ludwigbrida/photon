import type { RendererStats } from "@photon/renderer";
import { Button } from "../../../../ui/button/button.tsx";
import { Progress } from "../../../../ui/progress/progress.tsx";
import { formatElapsed } from "../../../format-elapsed.ts";

type RenderStatusPanelProps = {
  readonly stats: RendererStats;
  readonly ready: boolean;
  readonly onStart: () => void;
  readonly onStop: () => void;
};

export const RenderStatusPanel = ({ stats, ready, onStart, onStop }: RenderStatusPanelProps) => {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-[10px] font-medium uppercase tracking-wide text-text-muted">Status</h3>
      <dl className="divide-y divide-border border border-border">
        <div className="flex items-baseline justify-between px-2 py-1.5">
          <dt className="text-xs text-text-muted">Elapsed</dt>
          <dd className="text-xs">{formatElapsed(stats.elapsedMilliseconds)}</dd>
        </div>
        <div className="flex items-baseline justify-between px-2 py-1.5">
          <dt className="text-xs text-text-muted">Samples</dt>
          <dd className="text-xs">
            {stats.sampleCount} / {stats.maxSamples}
          </dd>
        </div>
      </dl>
      <Progress value={stats.sampleCount} max={stats.maxSamples} />
      <div className="flex gap-2">
        <Button
          variant="primary"
          onClick={onStart}
          disabled={!ready || stats.isRunning || stats.sampleCount >= stats.maxSamples}
        >
          Start
        </Button>
        <Button onClick={onStop} disabled={!stats.isRunning}>
          Stop
        </Button>
      </div>
    </section>
  );
};
