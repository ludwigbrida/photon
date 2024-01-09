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
			const { render, destroy } = createRenderer(canvas.current, device);
			let previousTime = 0;
			const frame = async (elapsedTime = previousTime) => {
				const deltaTime = elapsedTime - previousTime;
				render(deltaTime);
				previousTime = elapsedTime;
				requestAnimationFrame(frame);
			};
			requestAnimationFrame(frame);
			return destroy;
		}
	}, [canvas, device]);

	return <Canvas width={640} height={480} ref={canvas} />;
};
