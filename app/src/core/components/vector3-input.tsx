import { Vector3 } from "@ludwigbrida/photon";
import { Fragment } from "react";
import { Input } from "../../shared/components/input/input.tsx";

export type Vector3InputProps = {
	value: Vector3;
	onChange: (value: Vector3) => void;
};

export const Vector3Input = ({
	value: [x, y, z],
	onChange,
}: Vector3InputProps) => {
	return (
		<Fragment>
			<Input value={x} onChange={(x) => onChange([x, y, z])} />
			<Input value={y} onChange={(y) => onChange([x, y, z])} />
			<Input value={z} onChange={(z) => onChange([x, y, z])} />
		</Fragment>
	);
};
