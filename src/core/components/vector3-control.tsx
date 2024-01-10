import { Fragment } from "react";
import { Input } from "../../shared/components/input/input.tsx";
import { Vector3 } from "../../shared/types/vector3.ts";

export type Vector3ControlProps = {
	value: Vector3;
	onChange: (value: Vector3) => void;
};

export const Vector3Control = ({
	value: [x, y, z],
	onChange,
}: Vector3ControlProps) => {
	return (
		<Fragment>
			<Input value={x} onChange={(x) => onChange([x, y, z])} />
			<Input value={y} onChange={(y) => onChange([x, y, z])} />
			<Input value={z} onChange={(z) => onChange([x, y, z])} />
		</Fragment>
	);
};