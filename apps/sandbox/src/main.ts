import { mount } from "@photon/runtime";
import options from "./scenes/cornell.ts";

const main = document.getElementById("main") as HTMLElement;

mount(main, options);
