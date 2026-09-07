import clsx from "clsx";
import { Accordion } from "../../ui/accordion/accordion.tsx";
import styles from "./scene-panel.module.css";

type ScenePanelProps = {
  readonly visible: boolean;
};

export const ScenePanel = ({ visible }: ScenePanelProps) => {
  return (
    <aside className={clsx(styles.root, { [styles.hidden]: !visible })}>
      <div className={styles.header}>SCENE</div>
      <div className={styles.content}>
        <Accordion titles={["SUN", "SKY"]}>
          <div>TBD</div>
          <div>TBD</div>
        </Accordion>
      </div>
    </aside>
  );
};
