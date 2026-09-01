import { mount } from "@grainular/nord";
import { App } from "./app/app.ts";
import "./main.css";

const main = document.getElementById("main");

mount(App, { to: main });
