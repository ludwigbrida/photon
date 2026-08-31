import type { RendererStats } from "@photon/renderer";

type SidebarProps = {
  readonly stats: RendererStats;
  readonly ready: boolean;
  readonly onStart: () => void;
  readonly onStop: () => void;
};

const formatElapsed = (milliseconds: number) => `${(milliseconds / 1000).toFixed(1)} s`;

export const Sidebar = ({ stats, ready, onStart, onStop }: SidebarProps) => {
  return (
    <aside className="sidebar">
      <dl>
        <div>
          <dt>Elapsed</dt>
          <dd>{formatElapsed(stats.elapsedMilliseconds)}</dd>
        </div>
        <div>
          <dt>Samples</dt>
          <dd>
            {stats.sampleCount} / {stats.maxSamples}
          </dd>
        </div>
      </dl>
      <div>
        <button
          type="button"
          onClick={onStart}
          disabled={!ready || stats.isRunning || stats.sampleCount >= stats.maxSamples}
        >
          Start
        </button>
        <button type="button" onClick={onStop} disabled={!stats.isRunning}>
          Stop
        </button>
      </div>
    </aside>
  );
};
