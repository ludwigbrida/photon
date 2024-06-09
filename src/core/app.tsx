import { useContext, useEffect, useRef, useState } from "react";
import { createRenderer } from "../render";
import { Canvas } from "../shared/components/canvas/canvas.tsx";
import { Panel } from "../shared/components/panel/panel.tsx";
import { Select } from "../shared/components/select/select.tsx";
import { Vector3Input } from "../shared/components/vector3-input/vector3-input.tsx";
import classes from "./app.module.css";
import { Config } from "./contexts/config.tsx";
import { Device } from "./contexts/device.tsx";
import { Material } from "./contexts/material.tsx";
import { Scene } from "./contexts/scene.tsx";

export const App = () => {
	const { device } = useContext(Device);
	const { camera, setCamera } = useContext(Config);
	const { materials, serializedMaterials } = useContext(Material);
	const { entities, serializedPlanes, serializedSpheres } = useContext(Scene);

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
					serializedMaterials,
					serializedPlanes,
					serializedSpheres,
					new Float32Array([
						// Directional Light 1
						0.5,
						-0.75,
						-1,
						NaN,
						1,
						1,
						1,
						1,
					]),
					new Float32Array([
						// Point Light 1
						//-2,
						//1,
						//3,
						//NaN,
						//1,
						//0,
						//0,
						//1,
					]),
				);
				setFps(Math.floor(1000 / frameTime));
				previousTime = elapsedTime;
				step++;
				requestAnimationFrame(frame);
			};
			requestAnimationFrame(frame);
		}
	}, [render, serializedMaterials]);

	return (
		<div className={classes.app}>
			<div className={classes.scene}>
				<Panel header="Scene" footer={entities.length}>
					<Select
						items={entities
							.filter((entity) => entity.active)
							.map((entity) => entity.name)}
					/>
				</Panel>
			</div>
			<div className={classes.materials}>
				<Panel header="Materials" footer={materials.length}>
					<Select items={materials.map((material) => material.name)} />
				</Panel>
			</div>
			<div className={classes.render}>
				<Panel header="Render" footer={fps}>
					<Canvas width={512} height={512} ref={canvas} />
				</Panel>
			</div>
			<div className={classes.settings}>
				<Panel header="Config">
					<Vector3Input value={camera.current} onChange={setCamera} />
				</Panel>
			</div>
		</div>
	);
};
