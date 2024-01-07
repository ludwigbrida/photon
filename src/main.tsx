import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app.tsx";
import "./index.css";

const main = ReactDOM.createRoot(
	document.getElementById("main") as HTMLElement,
);
main.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
