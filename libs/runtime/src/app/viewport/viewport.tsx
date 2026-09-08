import type { Camera } from "@photon/core";
import type { RendererTelemetry } from "@photon/renderer";
import type { World } from "@photon/world";
import clsx from "clsx";
import type { RefObject } from "react";
import { formatDuration } from "../../format-duration.ts";
import { Button } from "../../ui/button/button.tsx";
import { Metric } from "../../ui/metric/metric.tsx";
import { Stack } from "../../ui/stack/stack.tsx";
import { RasterizerCanvas } from "./rasterizer-canvas.tsx";
import styles from "./viewport.module.css";

type ViewportMode = "pathTracer" | "rasterizer";

type ViewportProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  camera: Camera;
  world?: World;
  mode: ViewportMode;
  telemetry: RendererTelemetry;
  ready: boolean;
  headerPanelVisible: boolean;
  scenePanelVisible: boolean;
  contextPanelVisible: boolean;
  footerPanelVisible: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onHeaderPanelVisibleChange: () => void;
  onScenePanelVisibleChange: () => void;
  onContextPanelVisibleChange: () => void;
  onFooterPanelVisibleChange: () => void;
  onModeChange: (mode: ViewportMode) => void;
};

export const Viewport = ({
  canvasRef,
  camera,
  world,
  mode,
  telemetry,
  ready,
  headerPanelVisible,
  scenePanelVisible,
  contextPanelVisible,
  footerPanelVisible,
  onStart,
  onStop,
  onReset,
  onHeaderPanelVisibleChange,
  onScenePanelVisibleChange,
  onContextPanelVisibleChange,
  onFooterPanelVisibleChange,
  onModeChange,
}: ViewportProps) => {
  const state = telemetry,
    isRendering = state.isRunning;
  const elapsed = formatDuration(state.elapsedMilliseconds);
  const toggles = [
    ["L", "Toggle scene navigation", scenePanelVisible, onScenePanelVisibleChange],
    ["T", "Toggle top bar", headerPanelVisible, onHeaderPanelVisibleChange],
    ["B", "Toggle bottom bar", footerPanelVisible, onFooterPanelVisibleChange],
    ["R", "Toggle render sidebar", contextPanelVisible, onContextPanelVisibleChange],
  ] as const;

  return (
    <section className={styles.root}>
      <div className={styles.pattern} />
      <canvas
        ref={canvasRef}
        className={clsx(styles.canvas, {
          [styles.canvasHidden]: mode !== "pathTracer",
          [styles.canvasPaused]: !isRendering,
        })}
        width="640"
        height="480"
      />
      {world && mode === "rasterizer" && (
        <div className={styles.rasterizerCanvas}>
          <RasterizerCanvas world={world} camera={camera} />
        </div>
      )}
      <div className={styles.telemetryBar}>
        <Stack orientation="horizontal" separator>
          <Metric label="RESOLUTION">640 × 480</Metric>
          <Metric label="TILES">
            {state.scheduling.bucketGridSize} × {state.scheduling.bucketGridSize}
          </Metric>
          <Metric label="SAMPLES">
            {state.sampleCount}/{state.maxSamples}
          </Metric>
          <Metric label="NOISE" unit="%">
            --
          </Metric>
          <Metric label="RATE" unit="/s">
            {(state.sampleCount / Math.max(state.elapsedMilliseconds / 1000, 0.01)).toFixed(1)}
          </Metric>
          <Metric label="RAYS" unit="M/s">
            --
          </Metric>
          <Metric label="ELAPSED">
            {elapsed.hours}:{elapsed.minutes}:{elapsed.seconds}
          </Metric>
        </Stack>
        {world && (
          <div className={styles.modeTabs}>
            <button
              className={clsx(styles.modeTab, { [styles.modeTabActive]: mode === "pathTracer" })}
              aria-pressed={mode === "pathTracer"}
              type="button"
              onClick={() => onModeChange("pathTracer")}
            >
              PATH TRACER
            </button>
            <button
              className={clsx(styles.modeTab, { [styles.modeTabActive]: mode === "rasterizer" })}
              aria-pressed={mode === "rasterizer"}
              type="button"
              onClick={() => onModeChange("rasterizer")}
            >
              RASTERIZER
            </button>
          </div>
        )}
        <div className={styles.layoutToggles}>
          {toggles.map(([label, ariaLabel, visible, onClick]) => (
            <button
              key={label}
              className={clsx(styles.layoutToggle, { [styles.layoutToggleHidden]: !visible })}
              aria-label={ariaLabel}
              aria-pressed={visible}
              type="button"
              onClick={onClick}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.cameraBadge}>
        CAMERA <span className={styles.metricValue}>01</span>
      </div>
      <div className={styles.actionGroup}>
        <Button disabled={!ready} onClick={isRendering ? onStop : onStart}>
          {isRendering ? "ACCUMULATING" : "PAUSED"}
        </Button>
        <Button disabled={!ready} onClick={onReset}>
          Reset
        </Button>
      </div>
    </section>
  );
};
