import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app.tsx";
import "./main.css";

const main = ReactDOM.createRoot(
	document.getElementById("main") as HTMLElement,
);
main.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
