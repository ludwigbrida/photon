import clsx from "clsx";
import packageJson from "../../../package.json";
import styles from "./header-panel.module.css";

type HeaderPanelProps = {
  readonly visible: boolean;
};

export const HeaderPanel = ({ visible }: HeaderPanelProps) => {
  return (
    <header className={clsx(styles.root, { [styles.hidden]: !visible })}>
      <h1>
        <span>🌈 Photon</span> <span className={styles.version}>v{packageJson.version}</span>
      </h1>
    </header>
  );
};
