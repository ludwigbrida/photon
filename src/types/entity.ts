import { Plane } from "./plane.ts";
import { Sphere } from "./sphere.ts";

export type Entity = Plane | Sphere;

export type EntityCommon = {
	name: string;
	active: boolean;
};
