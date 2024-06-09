import {
	createContext,
	Dispatch,
	PropsWithChildren,
	SetStateAction,
	useMemo,
	useState,
} from "react";
import { Plane } from "../../types/plane.ts";
import { backward, down, left, right, up } from "../../types/vector3.ts";

export type SceneProps = {
	planes: Plane[];
	serializedPlanes: Float32Array;
	setPlanes: Dispatch<SetStateAction<Plane[]>>;
};

export const Scene = createContext(null as unknown as SceneProps);

export const SceneContext = ({ children }: PropsWithChildren) => {
	const [planes, setPlanes] = useState<Plane[]>([
		{
			name: "Rear Wall",
			type: "plane",
			position: [0, 0, -3],
			normal: backward,
			materialIndex: 0,
			active: true,
		},
		{
			name: "Upper Wall",
			type: "plane",
			position: [0, 25, 0],
			normal: down,
			materialIndex: 0,
			active: false,
		},
		{
			name: "Lower Wall",
			type: "plane",
			position: [0, -3, 0],
			normal: up,
			materialIndex: 0,
			active: true,
		},
		{
			name: "Left Wall",
			type: "plane",
			position: [-25, 0, 0],
			normal: right,
			materialIndex: 1,
			active: false,
		},
		{
			name: "Right Wall",
			type: "plane",
			position: [3, 0, 0],
			normal: left,
			materialIndex: 2,
			active: true,
		},
	]);

	const serializedPlanes = useMemo(() => {
		return Float32Array.from(
			planes
				.filter((plane) => plane.active)
				.flatMap((plane) => [
					...plane.position,
					NaN,
					...plane.normal,
					plane.materialIndex,
				]),
		);
	}, [planes]);

	return (
		<Scene.Provider value={{ planes, serializedPlanes, setPlanes }}>
			{children}
		</Scene.Provider>
	);
};
