import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { Vector3Control } from "./core/components/vector3-control.tsx";
import { Device } from "./core/contexts/device.tsx";
import { Scene } from "./core/contexts/scene.tsx";
import { createRenderer } from "./renderer/renderer.ts";
import { Canvas } from "./shared/components/canvas/canvas.tsx";
import { Vector3 } from "./shared/types/vector3.ts";

export const App = () => {
	const { camera, setCamera } = useContext(Scene);
	const { device } = useContext(Device);
	const [render, setRender] = useState<ReturnType<typeof createRenderer>>();
	const [fps, setFps] = useState(0);

	const canvas = useRef<HTMLCanvasElement>(null);

	const cameraRef = useRef<Vector3>();

	useEffect(() => {
		if (device && canvas.current) {
			const render = createRenderer(device, canvas.current);
			setRender(() => render);
		}
	}, [device, canvas]);

	useEffect(() => {
		cameraRef.current = camera;
	}, [camera]);

	useEffect(() => {
		if (render && cameraRef.current) {
			let previousTime = 0;
			const frame = async (elapsedTime = previousTime) => {
				const deltaTime = elapsedTime - previousTime;
				const frameTime = await render(
					deltaTime,
					cameraRef.current!,
					new Int32Array([
						// Voxel 1
						0, 0, -10, 0,
						// Voxel 2
						2, 0, -10, 1,
					]),
					new Float32Array([
						// Material 1
						1.0, 0.5, 0.5,
						// Material 2
						0.3, 0.6, 0.9,
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
			<Vector3Control value={camera} onChange={setCamera} />
			{fps}
			<Canvas width={640} height={480} ref={canvas} />
		</Fragment>
	);
};
