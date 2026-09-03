import { mount as mountNord } from "@grainular/nord";
import { App } from "./app/app.ts";
import { createController, type RuntimeOptions } from "./controller.ts";
import "./mount.css";

export const mount = (target: HTMLElement, options: RuntimeOptions) => {
  const controller = createController(options);

  return mountNord(() => App({ controller }), { to: target });
};
