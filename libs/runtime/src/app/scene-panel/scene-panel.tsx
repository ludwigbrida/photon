import clsx from "clsx";
import { Accordion } from "../../ui/accordion/accordion.tsx";
import styles from "./scene-panel.module.css";
import { SunSection } from "./sun-section/sun-section.tsx";

type ScenePanelProps = {
  readonly visible: boolean;
};

export const ScenePanel = ({ visible }: ScenePanelProps) => {
  return (
    <aside className={clsx(styles.root, { [styles.hidden]: !visible })}>
      <div className={styles.header}>SCENE</div>
      <div className={styles.content}>
        <Accordion titles={["SUN", "SKY"]}>
          <SunSection />
          <div style={{ padding: "var(--size-12)" }}>TBD</div>
        </Accordion>
      </div>
    </aside>
  );
};
