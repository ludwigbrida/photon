import { createRenderer } from "@ludwigbrida/photon";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { Vector3Input } from "./core/components/vector3-input.tsx";
import { Device } from "./core/contexts/device.tsx";
import { Scene } from "./core/contexts/scene.tsx";
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
			const frame = async (elapsedTime = previousTime) => {
				const deltaTime = elapsedTime - previousTime;
				const frameTime = await render(
					deltaTime,
					camera.current,
					new Float32Array([
						// White
						1, 1, 1, 0,
						// Red
						1, 0, 0, 0,
						// Green
						0, 1, 0, 0,
						// Sphere 1
						1.0, 0.5, 0.5, 0,
						// Sphere 2
						0.5, 0.5, 0.1, 0,
					]),
					new Float32Array([
						// Back wall
						0, 0, -100, 0, 0, 0, 1, 0,
						// Top wall
						// 0, 10, 0, 0, 0, -1, 0, 0,
						// Bottom wall
						0, -10, 0, 0, 0, 1, 0, 0,
						// Left wall
						// -10, 0, 0, 0, 1, 0, 0, 1,
						// Right wall
						10, 0, 0, 0, -1, 0, 0, 2,
					]),
					new Float32Array([
						// Sphere 1
						-2, 0, -8, 0, 1, 3, 0, 0,
						// Sphere 2
						2, 0, -8, 0, 1, 4, 0, 0,
					]),
				);
				setFps(Math.floor(1000 / frameTime));
				previousTime = elapsedTime;
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
