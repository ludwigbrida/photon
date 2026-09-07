import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/app.tsx";
import { createController, type RuntimeOptions } from "./controller.ts";
import "./mount.css";

export const mount = (target: HTMLElement, options: RuntimeOptions) => {
  const controller = createController(options);

  const root = createRoot(target);
  root.render(createElement(App, { controller }));

  return () => root.unmount();
};
