import clsx from "clsx";
import { Metric } from "../../ui/metric/metric.tsx";
import { Stack } from "../../ui/stack/stack.tsx";
import styles from "./footer-panel.module.css";

type FooterPanelProps = {
  readonly ready: boolean;
  readonly visible: boolean;
};

export const FooterPanel = ({ ready, visible }: FooterPanelProps) => {
  const isReady = ready;
  return (
    <footer className={clsx(styles.root, { [styles.hidden]: !visible })}>
      <div className={styles.start}>
        <Stack>
          <Metric label="GPU">--</Metric>
          <Metric label="API">WEBGPU</Metric>
          <Metric label="VRAM">--</Metric>
          <Metric label="FPS">--</Metric>
          <Metric label="FRAME" unit="ms">
            --
          </Metric>
        </Stack>
      </div>
      <div className={styles.end}>
        <Stack>
          <Metric label="ERRORS">--</Metric>
          <span className={clsx({ [styles.deviceStatusReady]: isReady })}>
            {isReady ? "READY" : "INITIALIZING"}
          </span>
        </Stack>
      </div>
    </footer>
  );
};
