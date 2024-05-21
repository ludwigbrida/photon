import { Vector3 } from "../../../types/vector3.ts";
import { Input } from "../input/input.tsx";
import classes from "./vector3-input.module.css";

export type Vector3InputProps = {
	value: Vector3;
	onChange: (value: Vector3) => void;
};

export const Vector3Input = ({
	value: [x, y, z],
	onChange,
}: Vector3InputProps) => {
	return (
		<div className={classes.vector3Input}>
			<Input value={x} onChange={(x) => onChange([x, y, z])} />
			<Input value={y} onChange={(y) => onChange([x, y, z])} />
			<Input value={z} onChange={(z) => onChange([x, y, z])} />
		</div>
	);
};
