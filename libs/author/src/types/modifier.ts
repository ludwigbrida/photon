import { type Geometry } from "./geometry.ts";

export type Modifier = (geometry: Geometry) => Geometry;
