import { Plane } from "./plane.ts";
import { Sphere } from "./sphere.ts";

export type Entity = {
	name: string;
	active: boolean;
} & (Plane | Sphere);
