import { Transform } from "../../../types/transform.ts";
import { Vector3 } from "../../../types/vector3.ts";
import { Vector3Input } from "../vector3-input/vector3-input.tsx";
import classes from "./transform-input.module.css";

export type TransformInputProps = {
	value: Transform;
	onChange: (value: Transform) => void;
};

export const TransformInput = ({
	value: [
		translationX,
		translationY,
		translationZ,
		rotationX,
		rotationY,
		rotationZ,
		scaleX,
		scaleY,
		scaleZ,
	],
	onChange,
}: TransformInputProps) => {
	const translation: Vector3 = [translationX, translationY, translationZ];
	const rotation: Vector3 = [rotationX, rotationY, rotationZ];
	const scale: Vector3 = [scaleX, scaleY, scaleZ];

	return (
		<div className={classes.transformInput}>
			<Vector3Input
				value={translation}
				onChange={(translation) =>
					onChange([...translation, ...rotation, ...scale])
				}
			/>
			<Vector3Input
				value={rotation}
				onChange={(rotation) =>
					onChange([...translation, ...rotation, ...scale])
				}
			/>
			<Vector3Input
				value={scale}
				onChange={(scale) => onChange([...translation, ...rotation, ...scale])}
			/>
		</div>
	);
};
