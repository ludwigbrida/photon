import { Fragment, useContext, useEffect, useRef } from "react";
import { Vector3Input } from "./core/components/vector3-input.tsx";
import { Device } from "./core/contexts/device.tsx";
import { Scene } from "./core/contexts/scene.tsx";
import { createRenderer } from "./renderer/renderer.ts";
import { Canvas } from "./shared/components/canvas/canvas.tsx";

export const App = () => {
	const { device } = useContext(Device);
	const { camera, setCamera } = useContext(Scene);

	const canvas = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		console.log(camera);
	}, [camera]);

	useEffect(() => {
		if (device && canvas.current) {
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
	}, [device, canvas]);

	return (
		<Fragment>
			<Vector3Input value={camera} onChange={setCamera} />
			<Canvas width={640} height={480} ref={canvas} />
		</Fragment>
	);
};
