import { useEffect, useRef } from "react";
import classes from "./canvas.module.css";

export type CanvasProps = {
	width: number;
	height: number;
	run: (canvas: HTMLCanvasElement) => void;
};

export const Canvas = ({ width, height, run }: CanvasProps) => {
	const canvas = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		canvas.current && run(canvas.current);
	}, [canvas, run]);

	return (
		<canvas
			className={classes.canvas}
			ref={canvas}
			width={width}
			height={height}
		/>
	);
};
