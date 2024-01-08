import { createRenderer } from "./renderer/renderer.ts";
import { Canvas } from "./shared/components/canvas/canvas.tsx";

export const App = () => {
	const run = async (canvas: HTMLCanvasElement) => {
		const render = await createRenderer(canvas);
		let previousTime = 0;
		const frame = async (elapsedTime = previousTime) => {
			const deltaTime = elapsedTime - previousTime;
			render(deltaTime);
			previousTime = elapsedTime;
			requestAnimationFrame(frame);
		};
		requestAnimationFrame(frame);
	};

	return <Canvas width={640} height={480} run={run} />;
};
