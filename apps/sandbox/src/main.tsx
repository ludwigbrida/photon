import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/app.tsx";
import "./main.css";

const main = document.getElementById("main") as HTMLElement;

const root = createRoot(main);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
