import classes from "./canvas.module.css";

export type CanvasProps = {
	width: number;
	height: number;
};

export const Canvas = ({ width, height }: CanvasProps) => {
	return <canvas className={classes.canvas} width={width} height={height} />;
};
