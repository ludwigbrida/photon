import { html } from "@grainular/nord";
import packageJson from "../../../package.json";

export const TopBar = () => html`
  <header
    class="flex shrink-0 items-center border-b border-border bg-surface-raised px-4 py-2 leading-6"
  >
    <div class="flex items-center gap-4">
      <h1>
        🌈 <span>Photon</span>
        <span class="text-text-muted">v${packageJson.version}</span>
      </h1>
    </div>
  </header>
`;
