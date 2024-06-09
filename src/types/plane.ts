import { Vector3 } from "./vector3.ts";

export type Plane = {
	type: "plane";
	position: Vector3;
	normal: Vector3;
	materialIndex: number;
};
