import { EntityCommon } from "./entity.ts";
import { Vector3 } from "./vector3.ts";

export type Plane = EntityCommon & {
	type: "plane";
	position: Vector3;
	normal: Vector3;
	materialIndex: number;
};
