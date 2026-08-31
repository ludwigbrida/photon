import { Progress } from "../../ui/progress/progress.tsx";
import { formatElapsed } from "../format-elapsed.ts";

type StatusBarProps = {
  readonly elapsedMilliseconds: number;
  readonly sampleCount: number;
  readonly maxSamples: number;
};

export const StatusBar = ({ elapsedMilliseconds, sampleCount, maxSamples }: StatusBarProps) => {
  return (
    <footer className="flex h-7 shrink-0 items-center gap-3 border-t border-border px-3 text-text-muted">
      <span>
        Samples {sampleCount} / {maxSamples}
      </span>
      <div className="w-40">
        <Progress value={sampleCount} max={maxSamples} />
      </div>
      <span>Elapsed {formatElapsed(elapsedMilliseconds)}</span>
    </footer>
  );
};
