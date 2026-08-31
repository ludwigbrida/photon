import { RenderConfigPanel } from "./panels/render-config/render-config-panel.tsx";

type SidebarProps = {
  readonly ready: boolean;
  readonly maxSamples: number;
  readonly isRendering: boolean;
  readonly isComplete: boolean;
  readonly onStart: () => void;
  readonly onStop: () => void;
  readonly onMaxSamplesChange: (maxSamples: number) => void;
};

export const Sidebar = ({
  ready,
  maxSamples,
  isRendering,
  isComplete,
  onStart,
  onStop,
  onMaxSamplesChange,
}: SidebarProps) => {
  return (
    <aside className="flex w-56 shrink-0 flex-col gap-4 border-l border-border p-3">
      <h2 className="font-semibold tracking-wide">Render</h2>
      <RenderConfigPanel
        ready={ready}
        maxSamples={maxSamples}
        isRendering={isRendering}
        isComplete={isComplete}
        onStart={onStart}
        onStop={onStop}
        onMaxSamplesChange={onMaxSamplesChange}
      />
    </aside>
  );
};
