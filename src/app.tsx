import { Canvas } from "./shared/components/canvas/canvas.tsx";

export const App = () => {
	const run = (canvas: HTMLCanvasElement) => {
		console.log(canvas);
	};

	return <Canvas width={640} height={480} run={run} />;
};
