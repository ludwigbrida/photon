import { forwardRef, useEffect, useRef } from "react";
import classes from "./canvas.module.css";

export type CanvasProps = {
	width: number;
	height: number;
};

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
	({ width, height }, ref) => {
		const localRef = useRef<HTMLCanvasElement>(null);

		useEffect(() => {
			const node = localRef.current;
			const listener = () => {
				console.log("added");
			};
			if (node) {
				node.addEventListener("click", listener);
				return node.removeEventListener("click", listener);
			}
		}, [ref]);

		return (
			<canvas
				className={classes.canvas}
				width={width}
				height={height}
				ref={ref}
			/>
		);
	},
);
