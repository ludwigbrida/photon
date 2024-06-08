import { Entity } from "./entity.ts";
import { Vector3 } from "./vector3.ts";

export type Plane = Entity & {
	position: Vector3;
	normal: Vector3;
	materialIndex: number;
};
