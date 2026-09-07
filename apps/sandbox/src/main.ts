import { mount } from "@photon/runtime";
import scenes from "./scenes/index.ts";

const main = document.querySelector("#main") as HTMLElement;

mount(main, scenes.cornell);
