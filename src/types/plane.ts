import { Entity } from "./entity.ts";
import { Vector3 } from "./vector3.ts";

export type Plane = Entity & {
	normal: Vector3;
};
