import {
	createContext,
	Dispatch,
	PropsWithChildren,
	SetStateAction,
	useMemo,
	useState,
} from "react";
import { Entity } from "../../types/entity.ts";
import { Plane } from "../../types/plane.ts";
import { Sphere } from "../../types/sphere.ts";
import { backward, down, left, right, up } from "../../types/vector3.ts";

export type SceneProps = {
	entities: Entity[];
	setEntities: Dispatch<SetStateAction<Entity[]>>;

	serializedPlanes: Float32Array;
	serializedSpheres: Float32Array;
};

export const Scene = createContext(null as unknown as SceneProps);

export const SceneProvider = ({ children }: PropsWithChildren) => {
	const [entities, setEntities] = useState<Entity[]>([
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
		{
			name: "Left Sphere",
			type: "sphere",
			position: [-1, 0, 0],
			radius: 1,
			materialIndex: 3,
			active: true,
		},
		{
			name: "Right Sphere",
			type: "sphere",
			position: [1, 0, 0],
			radius: 1,
			materialIndex: 4,
			active: true,
		},
	]);

	const isPlane = (entity: Entity): entity is Plane =>
		entity.active && entity.type === "plane";

	const serializedPlanes = useMemo(() => {
		return Float32Array.from(
			entities
				.filter(isPlane)
				.flatMap((plane: Plane) => [
					...plane.position,
					NaN,
					...plane.normal,
					plane.materialIndex,
				]),
		);
	}, [entities]);

	const isSphere = (entity: Entity): entity is Sphere =>
		entity.active && entity.type === "sphere";

	const serializedSpheres = useMemo(() => {
		return Float32Array.from(
			entities
				.filter(isSphere)
				.flatMap((sphere: any) => [
					...sphere.position,
					sphere.radius,
					sphere.materialIndex,
					NaN,
					NaN,
					NaN,
				]),
		);
	}, [entities]);

	return (
		<Scene.Provider
			value={{ entities, setEntities, serializedPlanes, serializedSpheres }}
		>
			{children}
		</Scene.Provider>
	);
};
