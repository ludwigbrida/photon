import { derived, type Grain } from "@grainular/grains";
import { attr, html, mounted, on, type Ref, ref } from "@grainular/nord";
import type { RendererTelemetry } from "@photon/renderer";
import { formatDuration } from "../../format-duration.ts";
import { Button } from "../../ui/button/button.ts";
import styles from "./viewport.module.css";

type ViewportProps = {
  readonly canvasRef: Ref<HTMLCanvasElement>;
  readonly telemetry: Grain<RendererTelemetry>;
  readonly ready: Grain<boolean>;
  readonly isRendering: Grain<boolean>;
  readonly onStart: () => void;
  readonly onStop: () => void;
  readonly onReset: () => void;
  readonly onMount: () => () => void;
};

export const Viewport = ({
  canvasRef,
  telemetry,
  ready,
  isRendering,
  onStart,
  onStop,
  onReset,
  onMount,
}: ViewportProps) => {
  const sampleCount = derived(telemetry, ({ sampleCount: value }) => value);
  const maxSamples = derived(telemetry, ({ maxSamples: value }) => value);
  const elapsed = derived(telemetry, ({ elapsedMilliseconds }) =>
    formatDuration(elapsedMilliseconds),
  );
  const elapsedHours = derived(elapsed, ({ hours }) => hours);
  const elapsedMinutes = derived(elapsed, ({ minutes }) => minutes);
  const elapsedSeconds = derived(elapsed, ({ seconds }) => seconds);

  const samplesPerSecond = derived(telemetry, ({ sampleCount, elapsedMilliseconds }) =>
    (sampleCount / Math.max(elapsedMilliseconds / 1000, 0.01)).toFixed(1),
  );
  const bucketGridSize = derived(telemetry, ({ scheduling: { bucketGridSize } }) => bucketGridSize);
  const renderStatus = derived(isRendering, (value) => (value ? "ACCUMULATING" : "PAUSED"));
  const resetDisabled = derived(ready, (value) => !value);
  const canvasClass = derived(
    isRendering,
    (value) =>
      `image-pixelated relative z-10 block h-full w-full object-contain ${value ? "grayscale-0 brightness-100 opacity-100" : "grayscale brightness-75 opacity-80"}`,
  );
  const renderStatusClass = derived(isRendering, (value) =>
    value
      ? "flex items-center gap-2.5 border border-border bg-surface-recessed/90 px-2.5 py-1.5 text-status hover:bg-surface-raised active:border-input-border active:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      : "flex items-center gap-2.5 border border-border bg-surface-recessed/90 px-2.5 py-1.5 text-text-muted hover:bg-surface-raised active:border-input-border active:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
  );
  return html`
    <section class="relative min-w-0 flex-1 overflow-hidden bg-viewport-surface">
      <div class="${styles.pattern} pointer-events-none absolute inset-0"></div>
      <canvas
        ${attr({ class: canvasClass })}
        ${ref(canvasRef)}
        ${mounted(onMount)}
        width="640"
        height="480"
      ></canvas>
      <div
        class="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-10.5 items-center border-b border-border bg-surface-recessed/90 px-4 text-viewport-muted"
      >
        <div class="flex items-center gap-4">
          <span
            >RESOLUTION <span class="text-viewport-text">640</span
            ><span class="text-viewport-muted">×</span
            ><span class="text-viewport-text">480</span></span
          >
          <span class="h-4 w-px bg-border"></span>
          <span
            >TILES <span class="text-viewport-text">${bucketGridSize}</span
            ><span class="text-viewport-muted">×</span
            ><span class="text-viewport-text">${bucketGridSize}</span></span
          >
          <span class="h-4 w-px bg-border"></span>
          <span
            >SAMPLES <span class="text-viewport-text">${sampleCount}</span
            ><span class="text-viewport-muted">/</span
            ><span class="text-viewport-text">${maxSamples}</span></span
          >
          <span class="h-4 w-px bg-border"></span>
          <span
            >NOISE <span class="text-viewport-text">--</span
            ><span class="text-viewport-muted">%</span></span
          >
          <span class="h-4 w-px bg-border"></span>
          <span
            >RATE <span class="text-viewport-text">${samplesPerSecond}</span
            ><span class="text-viewport-muted">/s</span></span
          >
          <span class="h-4 w-px bg-border"></span>
          <span
            >RAYS <span class="text-viewport-text">--</span
            ><span class="text-viewport-muted">M/s</span></span
          >
          <span class="h-4 w-px bg-border"></span>
          <span
            >ELAPSED <span class="text-viewport-text">${elapsedHours}</span
            ><span class="text-viewport-muted">:</span
            ><span class="text-viewport-text">${elapsedMinutes}</span
            ><span class="text-viewport-muted">:</span
            ><span class="text-viewport-text">${elapsedSeconds}</span></span
          >
        </div>
      </div>
      <div class="pointer-events-none absolute left-4 top-14.5 z-20 flex gap-2">
        <span class="border border-border bg-surface-recessed/90 px-2 py-1.5 text-viewport-muted"
          >CAMERA <span class="text-viewport-text">01</span></span
        >
      </div>
      <div class="absolute right-4 top-14.5 z-20 flex items-center gap-2.5">
        <button
          ${attr({ class: renderStatusClass })}
          type="button"
          ${on("click", () => (isRendering() ? onStop() : onStart()))}
        >
          <span class="h-2 w-2 bg-current"></span>
          <span>${renderStatus}</span>
        </button>
        ${Button({ disabled: resetDisabled, onClick: onReset, children: "Reset" })}
      </div>
    </section>
  `;
};
