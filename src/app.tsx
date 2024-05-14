import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { Vector3Input } from "./core/components/vector3-input.tsx";
import { Device } from "./core/contexts/device.tsx";
import { Scene } from "./core/contexts/scene.tsx";
import { createRenderer } from "./renderer/renderer.ts";
import { Canvas } from "./shared/components/canvas/canvas.tsx";

export const App = () => {
	const { device } = useContext(Device);
	const { camera, setCamera } = useContext(Scene);
	const [render, setRender] = useState<ReturnType<typeof createRenderer>>();
	const [fps, setFps] = useState(0);

	const canvas = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (device && canvas.current) {
			const render = createRenderer(device, canvas.current);
			setRender(() => render);
		}
	}, [device, canvas]);

	useEffect(() => {
		if (render) {
			let previousTime = 0;
			let step = 0;
			const frame = async (elapsedTime = previousTime) => {
				if (step > 100) {
					setFps(0);
					return;
				}
				const deltaTime = elapsedTime - previousTime;
				const frameTime = await render(
					deltaTime,
					step,
					camera.current,
					new Float32Array([
						// White
						1,
						1,
						1,
						NaN,
						// Red
						1,
						0,
						0,
						NaN,
						// Green
						0,
						1,
						0,
						NaN,
					]),
					new Float32Array([
						// Back wall
						0,
						0,
						-100,
						NaN,
						0,
						0,
						1,
						0,
						// Top wall
						0,
						25,
						0,
						NaN,
						0,
						-1,
						0,
						0,
						// Bottom wall
						0,
						-25,
						0,
						NaN,
						0,
						1,
						0,
						0,
						// Left wall
						-25,
						0,
						0,
						NaN,
						1,
						0,
						0,
						1,
						// Right wall
						25,
						0,
						0,
						NaN,
						-1,
						0,
						0,
						2,
					]),
					new Float32Array([
						// Sphere 1
						-1.5,
						0,
						-8,
						1,
						0,
						NaN,
						NaN,
						NaN,
						// Sphere 2
						1.5,
						0,
						-8,
						1,
						0,
						NaN,
						NaN,
						NaN,
					]),
				);
				setFps(Math.floor(1000 / frameTime));
				previousTime = elapsedTime;
				step++;
				requestAnimationFrame(frame);
			};
			requestAnimationFrame(frame);
		}
	}, [render]);

	return (
		<Fragment>
			<Vector3Input value={camera.current} onChange={setCamera} />
			{fps}
			<Canvas width={512} height={512} ref={canvas} />
		</Fragment>
	);
};
