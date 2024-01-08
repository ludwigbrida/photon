import { useEffect, useRef } from "react";
import { createRenderer } from "./renderer/renderer.ts";
import { Canvas } from "./shared/components/canvas/canvas.tsx";

export const App = () => {
	const canvas = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (canvas.current) {
			// TODO: Retrieve device asynchronously in a useState and pass it as a dependency as well to resolve this mess

			createRenderer(canvas.current).then(({ render, cleanup }) => {
				let previousTime = 0;
				const frame = async (elapsedTime = previousTime) => {
					const deltaTime = elapsedTime - previousTime;
					render(deltaTime);
					previousTime = elapsedTime;
					requestAnimationFrame(frame);
				};
				requestAnimationFrame(frame);
				return cleanup;
			});
		}
	}, [canvas]);

	return <Canvas width={640} height={480} ref={canvas} />;
};
