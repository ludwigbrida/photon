import { Accordion as BaseAccordion } from "@base-ui/react";
import type { ReactNode } from "react";
import styles from "./accordion.module.css";

type AccordionProps<T extends readonly string[]> = {
  titles: T;
  children: {
    [I in keyof T]: ReactNode;
  };
};

export const Accordion = <const T extends readonly string[]>({
  titles,
  children,
}: AccordionProps<T>) => {
  return (
    <BaseAccordion.Root multiple hiddenUntilFound defaultValue={titles.map((_, index) => index)}>
      {titles.map((title, index) => (
        <BaseAccordion.Item className={styles.root} key={index} value={index}>
          <BaseAccordion.Header className={styles.header}>
            <BaseAccordion.Trigger className={styles.title}>{title}</BaseAccordion.Trigger>
          </BaseAccordion.Header>
          <BaseAccordion.Panel className={styles.panel}>{children[index]}</BaseAccordion.Panel>
        </BaseAccordion.Item>
      ))}
    </BaseAccordion.Root>
  );
};
