import { EntityCommon } from "./entity.ts";
import { Vector3 } from "./vector3.ts";

export type Sphere = EntityCommon & {
	type: "sphere";
	position: Vector3;
	radius: number;
	materialIndex: number;
};
