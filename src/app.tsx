import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { Vector3Input } from "./core/components/vector3-input.tsx";
import { Device } from "./core/contexts/device.tsx";
import { Scene } from "./core/contexts/scene.tsx";
import {
	Renderer as RendererType,
	createRenderer,
} from "./renderer/renderer.ts";
import { Canvas } from "./shared/components/canvas/canvas.tsx";
import { Vector3 } from "./shared/types/vector3.ts";

export const App = () => {
	const { camera, setCamera } = useContext(Scene);
	const { device } = useContext(Device);
	const [render, setRender] = useState<RendererType>();

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
		let previousTime = 0;
		const frame = async (elapsedTime = previousTime) => {
			const deltaTime = elapsedTime - previousTime;
			render && cameraRef.current && render(deltaTime, cameraRef.current);
			previousTime = elapsedTime;
			requestAnimationFrame(frame);
		};
		requestAnimationFrame(frame);
	}, [render]);

	return (
		<Fragment>
			<Vector3Input value={camera} onChange={setCamera} />
			<Canvas width={640} height={480} ref={canvas} />
		</Fragment>
	);
};
