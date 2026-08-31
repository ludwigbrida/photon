import { Button } from "../../../../ui/button/button.tsx";
import { NumberInput } from "../../../../ui/number-input/number-input.tsx";

type RenderConfigPanelProps = {
  readonly ready: boolean;
  readonly maxSamples: number;
  readonly isRendering: boolean;
  readonly isComplete: boolean;
  readonly onStart: () => void;
  readonly onStop: () => void;
  readonly onMaxSamplesChange: (maxSamples: number) => void;
};

export const RenderConfigPanel = ({
  ready,
  maxSamples,
  isRendering,
  isComplete,
  onStart,
  onStop,
  onMaxSamplesChange,
}: RenderConfigPanelProps) => {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-medium uppercase tracking-wide text-text-muted">Configuration</h3>
      <label className="flex items-center justify-between gap-3">
        <span className="text-text-muted">Max samples</span>
        <NumberInput value={maxSamples} disabled={!ready} onChange={onMaxSamplesChange} />
      </label>
      <div className="flex gap-2">
        <Button variant="primary" onClick={onStart} disabled={!ready || isRendering || isComplete}>
          Start
        </Button>
        <Button onClick={onStop} disabled={!isRendering}>
          Stop
        </Button>
      </div>
    </section>
  );
};
