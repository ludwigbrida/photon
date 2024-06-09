import { Vector3 } from "./vector3.ts";

export type Sphere = {
	type: "sphere";
	position: Vector3;
	radius: number;
	materialIndex: number;
};
