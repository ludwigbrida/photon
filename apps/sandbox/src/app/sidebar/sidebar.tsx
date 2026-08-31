import type { RendererStats } from "@photon/renderer";
import { RenderStatusPanel } from "./panels/render-status/render-status-panel.tsx";

type SidebarProps = {
  readonly stats: RendererStats;
  readonly ready: boolean;
  readonly onStart: () => void;
  readonly onStop: () => void;
};

export const Sidebar = ({ stats, ready, onStart, onStop }: SidebarProps) => {
  return (
    <aside className="flex w-56 shrink-0 flex-col gap-4 border-l border-border p-3">
      <h2 className="text-xs font-semibold tracking-wide">Render</h2>
      <RenderStatusPanel stats={stats} ready={ready} onStart={onStart} onStop={onStop} />
    </aside>
  );
};
