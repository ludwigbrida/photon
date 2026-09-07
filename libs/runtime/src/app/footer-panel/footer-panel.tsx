import clsx from "clsx";
import { Field } from "../../ui/field/field.tsx";
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
        <Stack
          items={[
            <Field label="GPU">--</Field>,
            <Field label="API">WEBGPU</Field>,
            <Field label="VRAM">--</Field>,
            <Field label="FPS">--</Field>,
            <Field label="FRAME" unit="ms">
              --
            </Field>,
          ]}
        />
      </div>
      <div className={styles.end}>
        <Stack
          items={[
            <Field label="ERRORS">--</Field>,
            <span className={clsx({ [styles.deviceStatusReady]: isReady })}>
              {isReady ? "READY" : "INITIALIZING"}
            </span>,
          ]}
        />
      </div>
    </footer>
  );
};
