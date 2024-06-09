import "@fontsource-variable/inter";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./core/app.tsx";
import { ConfigProvider } from "./core/contexts/config.tsx";
import { DeviceProvider } from "./core/contexts/device.tsx";
import { MaterialProvider } from "./core/contexts/material.tsx";
import { SceneProvider } from "./core/contexts/scene.tsx";
import "./main.css";

const main = ReactDOM.createRoot(
	document.getElementById("main") as HTMLElement,
);
main.render(
	<React.StrictMode>
		<DeviceProvider>
			<ConfigProvider>
				<MaterialProvider>
					<SceneProvider>
						<App />
					</SceneProvider>
				</MaterialProvider>
			</ConfigProvider>
		</DeviceProvider>
	</React.StrictMode>,
);
