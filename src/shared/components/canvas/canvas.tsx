import { forwardRef } from "react";
import classes from "./canvas.module.css";

export type CanvasProps = {
	width: number;
	height: number;
};

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
	({ width, height }, ref) => {
		return (
			<canvas
				className={classes.canvas}
				ref={ref}
				width={width}
				height={height}
			/>
		);
	},
);
