import "@fontsource-variable/inter";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./core/app.tsx";
import { DeviceContext } from "./core/contexts/device.tsx";
import { MaterialProvider } from "./core/contexts/material.tsx";
import { SceneContext } from "./core/contexts/scene.tsx";
import { SettingsContext } from "./core/contexts/settings.tsx";
import "./main.css";

const main = ReactDOM.createRoot(
	document.getElementById("main") as HTMLElement,
);
main.render(
	<React.StrictMode>
		<DeviceContext>
			<SettingsContext>
				<MaterialProvider>
					<SceneContext>
						<App />
					</SceneContext>
				</MaterialProvider>
			</SettingsContext>
		</DeviceContext>
	</React.StrictMode>,
);
