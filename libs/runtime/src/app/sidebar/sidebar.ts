import type { Grain } from "@grainular/grains";
import { html } from "@grainular/nord";
import type { Vector3 } from "@photon/core";
import type { CameraYawPitch } from "../../camera/orientation.ts";
import { RenderConfigPanel } from "./panels/render-config/render-config-panel.ts";

type SidebarProps = {
  readonly ready: Grain<boolean>;
  readonly gpuBudget: Grain<number>;
  readonly cameraPosition: Grain<Vector3>;
  readonly cameraYawPitch: Grain<CameraYawPitch>;
  readonly onGpuBudgetChange: (gpuBudget: number) => void;
  readonly onCameraPositionChange: (position: Vector3) => void;
  readonly onCameraYawPitchChange: (yawPitch: CameraYawPitch) => void;
};

export const Sidebar = (props: SidebarProps) => html`
  <aside class="flex w-106.5 shrink-0 flex-col border-l border-border bg-surface-raised">
    <div class="flex shrink-0 items-center border-b border-border px-4 py-2 leading-6">
      <h2 class="font-medium tracking-wider text-text-muted">RENDER</h2>
    </div>
    ${RenderConfigPanel(props)}
  </aside>
`;
