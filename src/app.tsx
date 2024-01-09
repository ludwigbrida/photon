import { Fragment, useEffect, useRef, useState } from "react";
import { Vector3Input } from "./core/components/vector3-input.tsx";
import { createDevice } from "./renderer/helpers/device.ts";
import { createRenderer } from "./renderer/renderer.ts";
import { Canvas } from "./shared/components/canvas/canvas.tsx";
import { Vector3 } from "./shared/types/vector3.ts";

export const App = () => {
	const canvas = useRef<HTMLCanvasElement>(null);
	const [device, setDevice] = useState<GPUDevice>();

	const [camera, setCamera] = useState<Vector3>([0, 0, 0]);

	useEffect(() => {
		createDevice().then((device) => setDevice(device));
	}, []);

	useEffect(() => {
		console.log(camera);
	}, [camera]);

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

	return (
		<Fragment>
			<Vector3Input value={camera} onChange={setCamera} />
			<Canvas width={640} height={480} ref={canvas} />
		</Fragment>
	);
};
