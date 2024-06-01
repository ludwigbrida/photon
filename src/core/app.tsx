import { useContext, useEffect, useRef, useState } from "react";
import { createRenderer } from "../render";
import { Canvas } from "../shared/components/canvas/canvas.tsx";
import { Panel } from "../shared/components/panel/panel.tsx";
import { Vector3Input } from "../shared/components/vector3-input/vector3-input.tsx";
import classes from "./app.module.css";
import { Device } from "./contexts/device.tsx";
import { Scene } from "./contexts/scene.tsx";

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
				/* if (step > 100) {
					setFps(0);
					return;
				} */
				const deltaTime = elapsedTime - previousTime;
				const frameTime = await render(
					deltaTime,
					step,
					camera.current,
					new Float32Array([
						// White
						1, 1, 1, 0,
						// Red
						1, 0, 0, 0,
						// Green
						0, 1, 0, 0,
						// Left Sphere
						0, 0, 0, 1,
						// Right Sphere
						1, 1, 1, 0,
					]),
					new Float32Array([
						// Back wall
						0,
						0,
						-3,
						NaN,
						0,
						0,
						1,
						0,
						// Top wall
						//0,
						//25,
						//0,
						//NaN,
						//0,
						//-1,
						//0,
						//0,
						// Bottom wall
						0,
						-3,
						0,
						NaN,
						0,
						1,
						0,
						0,
						// Left wall
						//-25,
						//0,
						//0,
						//NaN,
						//1,
						//0,
						//0,
						//1,
						// Right wall
						3,
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
						-1,
						0,
						0,
						1,
						3,
						NaN,
						NaN,
						NaN,
						// Sphere 2
						1,
						0,
						0,
						1,
						4,
						NaN,
						NaN,
						NaN,
					]),
					new Float32Array([
						// Directional Light 1
						1,
						1,
						1,
						NaN,
						0.5,
						-0.75,
						-1,
						NaN,
					]),
					new Float32Array([
						// Point Light 1
						1,
						1,
						1,
						NaN,
						-2,
						1,
						3,
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
		<div className={classes.app}>
			<div className={classes.scene}>
				<Panel header="Scene" />
			</div>
			<div className={classes.materials}>
				<Panel header="Materials" />
			</div>
			<div className={classes.render}>
				<Panel header="Render" footer={fps}>
					<Canvas width={512} height={512} ref={canvas} />
				</Panel>
			</div>
			<div className={classes.settings}>
				<Panel header="Settings">
					<Vector3Input value={camera.current} onChange={setCamera} />
				</Panel>
			</div>
		</div>
	);
};
