import { mount } from "@photon/runtime";
import scenes from "./scenes/index.ts";

const main = document.getElementById("main") as HTMLElement;

mount(main, scenes.cornell);
