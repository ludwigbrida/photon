import clsx from "clsx";
import styles from "./scene-panel.module.css";

type ScenePanelProps = {
  readonly visible: boolean;
};

export const ScenePanel = ({ visible }: ScenePanelProps) => {
  return (
    <aside className={clsx(styles.root, { [styles.hidden]: !visible })}>
      <div className={styles.header}>SCENE</div>
      <p className={styles.content}>TBD</p>
    </aside>
  );
};
