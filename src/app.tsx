import { useEffect, useRef, useState } from "react";
import { createDevice } from "./renderer/helpers/device.ts";
import { createRenderer } from "./renderer/renderer.ts";
import { Canvas } from "./shared/components/canvas/canvas.tsx";

export const App = () => {
	const canvas = useRef<HTMLCanvasElement>(null);
	const [device, setDevice] = useState<GPUDevice>();

	useEffect(() => {
		createDevice().then((device) => setDevice(device));
	}, []);

	useEffect(() => {
		if (canvas.current && device) {
			console.log(device);
			// TODO: Retrieve device asynchronously in a useState and pass it as a dependency as well to resolve this mess
			const { render, cleanup } = createRenderer(canvas.current, device);
			let previousTime = 0;
			const frame = async (elapsedTime = previousTime) => {
				const deltaTime = elapsedTime - previousTime;
				render(deltaTime);
				previousTime = elapsedTime;
				requestAnimationFrame(frame);
			};
			requestAnimationFrame(frame);
			return cleanup;
		}
	}, [canvas, device]);

	return <Canvas width={640} height={480} ref={canvas} />;
};
